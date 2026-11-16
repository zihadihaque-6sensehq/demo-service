import {
  BadRequestException,
  GatewayTimeoutException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GetContactInitiationQueryDto } from './dto/get-contact-initiation-query.dto';
import { GetMarketingContentBundleQueryDto } from './dto/get-marketing-content-bundle-query.dto';
import { GetPartnerLogoAssetsQueryDto } from './dto/get-partner-logo-assets-query.dto';
import { GetSiteNavigationRoutesQueryDto } from './dto/get-site-navigation-routes-query.dto';
import { normalizeContactInitiationPayload } from './dto/contact-initiation-payload.dto';
import { PostContactInitiationDto } from './dto/post-contact-initiation.dto';
import {
  ContactInitiationGetResponse,
  ContactInitiationPostResponse,
  MarketingContentBundleResponse,
  MarketingContentFallbacks,
  PartnerLogo,
  PartnerLogoAssetsResponse,
  SiteNavigationRoute,
  SiteNavigationRoutesResponse,
} from './home-laptop.types';

const DEFAULT_SEGMENT_TAGS = [
  'Startups',
  'Enterprise leaders',
  'Media & Publishers',
  'Social Good',
] as const;

const PARTNER_ASSET_CATALOG: Record<
  string,
  { brandName: string; displayOrder: number }
> = {
  zapier: { brandName: 'Zapier', displayOrder: 1 },
  spotify: { brandName: 'Spotify', displayOrder: 2 },
  zoom: { brandName: 'Zoom', displayOrder: 3 },
  slack: { brandName: 'Slack', displayOrder: 4 },
  amazon: { brandName: 'Amazon', displayOrder: 5 },
  adobe: { brandName: 'Adobe', displayOrder: 6 },
};

const DEFAULT_NAV_ROUTES: SiteNavigationRoute[] = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Work', path: '/work' },
  { label: 'Process', path: '/process' },
  { label: 'About', path: '/about' },
  { label: 'Careers', path: '/careers' },
];

const VALID_CONTACT_DESTINATIONS = new Set([
  '/contact',
  '/#contact',
  'modal:home-contact',
  'modal:contact',
]);

@Injectable()
export class HomeLaptopService {
  getMarketingContentBundle(
    query: GetMarketingContentBundleQueryDto,
  ): MarketingContentBundleResponse {
    this.assertContactOperational('marketing');

    if (process.env.HOME_LAP_SIMULATE_MARKETING_PARTIAL === 'true') {
      throw new InternalServerErrorException({
        message: 'Marketing content partially unavailable',
        userVisibleError:
          'Some home page content could not be loaded. Showing fallback copy.',
        fallbacks: this.marketingFallbacks(),
      });
    }

    if (
      query.pageKey !== 'home' ||
      process.env.HOME_LAP_SIMULATE_MARKETING_NOT_FOUND === 'true'
    ) {
      throw new NotFoundException({
        message: `Marketing content bundle not found for pageKey="${query.pageKey}" and locale="${query.locale}"`,
        userVisibleError:
          'Home marketing content is unavailable. Fallback copy is provided.',
        fallbacks: this.marketingFallbacks(),
      });
    }

    return {
      headline:
        process.env.HOME_LAP_HERO_HEADLINE ??
        'A Digital Product Studio that will Work',
      forLabel: process.env.HOME_LAP_FOR_LABEL ?? 'For',
      segmentTags: this.loadSegmentTags(),
      trustBadgeText:
        process.env.HOME_LAP_TRUST_BADGE_TEXT ?? 'Trusted By 250+ Companies',
    };
  }

  getPartnerLogoAssets(
    query: GetPartnerLogoAssetsQueryDto,
  ): PartnerLogoAssetsResponse {
    this.assertContactOperational('partner-logos');

    if (process.env.HOME_LAP_SIMULATE_LOGO_TIMEOUT === 'true') {
      throw new GatewayTimeoutException({
        message: 'Partner logo request timed out',
        userVisibleError:
          'Partner logos are loading slowly. Progressive display may continue.',
        logos: this.buildProgressiveLogos(query.assetIds, query.format),
      });
    }

    const logos = this.buildLogosWithFallbacks(query.assetIds, query.format);
    const resolvedCount = logos.filter((logo) => !logo.url.includes('fallback'))
      .length;

    if (query.assetIds.length === 1 && resolvedCount === 0) {
      throw new NotFoundException({
        message: `Partner logo asset not found: ${query.assetIds[0]}`,
        userVisibleError: `${logos[0]?.brandName ?? 'Partner'} logo unavailable; placeholder shown.`,
        logos,
      });
    }

    return { logos };
  }

  getSiteNavigationRoutes(
    query: GetSiteNavigationRoutesQueryDto,
  ): SiteNavigationRoutesResponse {
    const routes = this.loadNavigationRoutes();

    if (query.path) {
      const match = routes.find((route) => route.path === query.path);
      if (!match) {
        throw new NotFoundException({
          message: `No navigation route configured for path="${query.path}"`,
          userVisibleError:
            'Navigation could not be resolved for this path. Default site menu is available.',
          routes,
        });
      }
    }

    return { routes };
  }

  getContactInitiation(
    query: GetContactInitiationQueryDto,
  ): ContactInitiationGetResponse {
    this.assertContactOperational('contact-get');

    if (query.destinationRoute && !this.isValidContactDestination(query.destinationRoute)) {
      throw new BadRequestException({
        message: `Invalid contact destination route: ${query.destinationRoute}`,
        userVisibleError:
          'Contact Us is temporarily misconfigured. Please try again or use another entry point.',
      });
    }

    if (query.destinationRoute?.startsWith('modal:')) {
      return {
        modalContentRef:
          query.formId ??
          process.env.HOME_LAP_CONTACT_MODAL_REF ??
          'home-contact-modal',
      };
    }

    if (query.destinationRoute) {
      return { redirectUrl: query.destinationRoute };
    }

    const defaultMode = process.env.HOME_LAP_CONTACT_DEFAULT_MODE ?? 'modal';
    if (defaultMode === 'redirect') {
      return {
        redirectUrl:
          process.env.HOME_LAP_CONTACT_REDIRECT_URL ?? '/contact',
      };
    }

    return {
      modalContentRef:
        process.env.HOME_LAP_CONTACT_MODAL_REF ?? 'home-contact-modal',
    };
  }

  postContactInitiation(
    dto: PostContactInitiationDto,
  ): ContactInitiationPostResponse {
    this.assertContactOperational('contact-post');

    if (dto.destinationRoute && !this.isValidContactDestination(dto.destinationRoute)) {
      throw new BadRequestException({
        message: `Invalid contact destination route: ${dto.destinationRoute}`,
        userVisibleError:
          'We could not start the contact flow because the destination is invalid.',
      });
    }

    const formId =
      dto.formId ?? process.env.HOME_LAP_CONTACT_FORM_ID ?? 'home-contact';

    if (dto.payload) {
      dto.payload = normalizeContactInitiationPayload(dto.payload);
    } else if (process.env.HOME_LAP_CONTACT_REQUIRE_PAYLOAD === 'true') {
      throw new BadRequestException({
        message: 'Validation failed: payload is required for contact submission',
        userVisibleError: 'Contact form data is missing. Please complete the form.',
      });
    }

    const nextStep =
      dto.destinationRoute?.startsWith('modal:') || !dto.destinationRoute
        ? `open-modal:${formId}`
        : `redirect:${dto.destinationRoute}`;

    return {
      accepted: true,
      nextStep,
    };
  }

  private marketingFallbacks(): MarketingContentFallbacks {
    return {
      headline: process.env.HOME_LAP_FALLBACK_HEADLINE ?? '—',
      forLabel: process.env.HOME_LAP_FALLBACK_FOR_LABEL ?? 'For',
      segmentTags: [...DEFAULT_SEGMENT_TAGS],
      trustBadgeText:
        process.env.HOME_LAP_FALLBACK_TRUST_BADGE ?? 'Trusted By 250+ Companies',
    };
  }

  private loadSegmentTags(): string[] {
    const raw = process.env.HOME_LAP_SEGMENT_TAGS_JSON;
    if (!raw) {
      return [...DEFAULT_SEGMENT_TAGS];
    }
    try {
      const parsed = JSON.parse(raw) as string[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('invalid');
      }
      return parsed;
    } catch {
      throw new InternalServerErrorException({
        message: 'Invalid HOME_LAP_SEGMENT_TAGS_JSON configuration',
        userVisibleError:
          'Home page content could not be loaded. Showing fallback segment labels.',
        fallbacks: this.marketingFallbacks(),
      });
    }
  }

  private loadNavigationRoutes(): SiteNavigationRoute[] {
    const raw = process.env.HOME_LAP_NAV_ROUTES_JSON;
    if (!raw) {
      return [...DEFAULT_NAV_ROUTES];
    }
    try {
      const parsed = JSON.parse(raw) as SiteNavigationRoute[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('invalid');
      }
      return parsed;
    } catch {
      throw new InternalServerErrorException({
        message: 'Invalid HOME_LAP_NAV_ROUTES_JSON configuration',
        userVisibleError:
          'Site navigation is temporarily unavailable. Default menu paths are shown.',
        routes: DEFAULT_NAV_ROUTES,
      });
    }
  }

  private buildLogosWithFallbacks(
    assetIds: string[],
    format: string,
  ): PartnerLogo[] {
    const cdnBase =
      process.env.HOME_LAP_PARTNER_LOGO_CDN_BASE ??
      'https://cdn.example.com/partners';

    return assetIds.map((assetId, index) => {
      const catalogEntry = PARTNER_ASSET_CATALOG[assetId.toLowerCase()];
      const brandName =
        catalogEntry?.brandName ??
        assetId.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      if (!catalogEntry) {
        return {
          brandName,
          url: `${cdnBase}/fallback.${format}`,
          altText: `${brandName} logo`,
          displayOrder: index + 1,
        };
      }

      return {
        brandName: catalogEntry.brandName,
        url: `${cdnBase}/${assetId.toLowerCase()}.${format}`,
        altText: `${catalogEntry.brandName} logo`,
        displayOrder: catalogEntry.displayOrder,
      };
    });
  }

  private buildProgressiveLogos(
    assetIds: string[],
    format: string,
  ): PartnerLogo[] {
    const logos = this.buildLogosWithFallbacks(assetIds, format);
    const progressiveCount = Math.max(1, Math.floor(logos.length / 2));
    return logos.map((logo, index) =>
      index < progressiveCount
        ? logo
        : {
            ...logo,
            url: logo.url.replace(
              /\/[^/]+$/,
              `/fallback.${format}`,
            ),
          },
    );
  }

  private isValidContactDestination(destinationRoute: string): boolean {
    return VALID_CONTACT_DESTINATIONS.has(destinationRoute);
  }

  private assertContactOperational(scope: string): void {
    if (process.env.HOME_LAP_SIMULATE_SERVER_ERROR === 'true') {
      throw new InternalServerErrorException({
        message: `Home laptop service unavailable (${scope})`,
        userVisibleError:
          'Something went wrong loading this part of the home page. Please refresh and try again.',
      });
    }
  }
}