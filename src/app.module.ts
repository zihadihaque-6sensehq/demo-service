import { Module } from '@nestjs/common';
import { InvitedModule } from './invited/invited.module';
import { OverviewModule } from './overview/overview.module';

@Module({
  imports: [OverviewModule, InvitedModule],
})
export class AppModule {}
