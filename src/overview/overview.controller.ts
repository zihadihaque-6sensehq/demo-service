import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { AdminAuthenticatedRequest } from '../auth/admin-request';
import { ExportCustomersDto } from './dto/export-customers.dto';
import { GetCustomersQueryDto } from './dto/get-customers-query.dto';
import { OverviewService } from './overview.service';
import {
  CustomersListResponse,
  ExportCustomersResponse,
} from './overview.types';

@Controller()
@UseGuards(AdminAuthGuard)
export class OverviewController {
  constructor(private readonly overviewService: OverviewService) {}

  @Get('/customers')
  getCustomers(@Query() query: GetCustomersQueryDto): CustomersListResponse {
    return this.overviewService.listCustomers(query);
  }

  @Post('customers/export')
  exportCustomers(
    @Body() body: ExportCustomersDto,
    @Req() request: AdminAuthenticatedRequest,
  ): ExportCustomersResponse {
    return this.overviewService.startExport(body, request.adminIdentity);
  }
}
