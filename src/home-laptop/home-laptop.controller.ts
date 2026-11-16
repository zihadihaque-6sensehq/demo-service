import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GetContactInitiationQueryDto } from './dto/get-contact-initiation-query.dto';
import { GetMarketingContentBundleQueryDto } from './dto/get-marketing-content-bundle-query.dto';
import { GetPartnerLogoAssetsQueryDto } from './dto/get-partner-logo-assets-query.dto';
import { GetSiteNavigationRoutesQueryDto } from './dto/get-site-navigation-routes-query.dto';
import { PostContactInitiationDto } from './dto/post-contact-initiation.dto';
import { HomeLaptopService } from './home-laptop.service';
import {
  ContactInitiationGetResponse,
  ContactInitiationPostResponse,
  MarketingContentBundleResponse,
  PartnerLogoAssetsResponse,
  SiteNavigationRoutesResponse,
} from './home-laptop.types';

@Controller('logical')
export class HomeLaptopController {
  constructor(private readonly homeLaptopService: HomeLaptopService) {}

  @Get('marketing-content-bundle')
  getMarketingContentBundle(
    @Query() query: GetMarketingContentBundleQueryDto,
  ): MarketingContentBundleResponse {
    return this.homeLaptopService.getMarketingContentBundle(query);
  }

  @Get('partner-logo-assets')
  getPartnerLogoAssets(
    @Query() query: GetPartnerLogoAssetsQueryDto,
  ): PartnerLogoAssetsResponse {
    return this.homeLaptopService.getPartnerLogoAssets(query);
  }

  @Get('site-navigation-routes')
  getSiteNavigationRoutes(
    @Query() query: GetSiteNavigationRoutesQueryDto,
  ): SiteNavigationRoutesResponse {
    return this.homeLaptopService.getSiteNavigationRoutes(query);
  }

  @Get('contact-initiation')
  getContactInitiation(
    @Query() query: GetContactInitiationQueryDto,
  ): ContactInitiationGetResponse {
    return this.homeLaptopService.getContactInitiation(query);
  }

  @Post('contact-initiation')
  postContactInitiation(
    @Body() body: PostContactInitiationDto,
  ): ContactInitiationPostResponse {
    return this.homeLaptopService.postContactInitiation(body);
  }
}