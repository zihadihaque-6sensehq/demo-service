import type { Type } from '@nestjs/common';

export type MarketingContentBundleResponse = {
  headline: string;
  forLabel: string;
  segmentTags: string[];
  trustBadgeText: string;
};

export type PartnerLogo = {
  brandName: string;
  url: string;
  altText: string;
  displayOrder: number;
};

export type PartnerLogoAssetsResponse = {
  logos: PartnerLogo[];
};

export type SiteNavigationRoute = {
  label: string;
  path: string;
};

export type SiteNavigationRoutesResponse = {
  routes: SiteNavigationRoute[];
};

export type ContactInitiationGetResponse = {
  redirectUrl?: string;
  modalContentRef?: string;
};

export type ContactInitiationPostResponse = {
  accepted: boolean;
  nextStep: string;
};

export type MarketingContentFallbacks = MarketingContentBundleResponse;