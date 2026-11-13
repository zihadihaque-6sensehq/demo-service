import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { AdminAuthenticatedRequest } from '../auth/admin-request';
import { GetCustomerFiltersQueryDto } from './dto/get-customer-filters-query.dto';
import { GetInvitedQueryDto } from './dto/get-invited-query.dto';
import { SendInviteDto } from './dto/send-invite.dto';
import { InvitedService } from './invited.service';
import {
  CustomerFiltersResponse,
  InvitedListResponse,
  SendInviteResponse,
} from './invited.types';

@Controller()
@UseGuards(AdminAuthGuard)
export class InvitedController {
  constructor(private readonly invitedService: InvitedService) {}

  @Get('/customers/invited')
  getInvited(@Query() query: GetInvitedQueryDto): InvitedListResponse {
    return this.invitedService.listInvited(query);
  }

  @Post('/customers/invites')
  sendInvite(
    @Body() body: SendInviteDto,
    @Req() request: AdminAuthenticatedRequest,
  ): SendInviteResponse {
    return this.invitedService.sendInvite(body, request.adminIdentity);
  }

  @Get('/customers/filters')
  getFilters(
    @Query() query: GetCustomerFiltersQueryDto,
  ): CustomerFiltersResponse {
    return this.invitedService.getFilters(query);
  }
}
