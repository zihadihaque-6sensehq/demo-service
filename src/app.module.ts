import { Module } from '@nestjs/common';
import { HomeLaptopModule } from './home-laptop/home-laptop.module';
import { InvitedModule } from './invited/invited.module';
import { OverviewModule } from './overview/overview.module';

@Module({
  imports: [OverviewModule, InvitedModule, HomeLaptopModule],
})
export class AppModule {}
