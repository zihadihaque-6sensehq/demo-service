import { Module } from '@nestjs/common';
import { HomeLaptopController } from './home-laptop.controller';
import { HomeLaptopService } from './home-laptop.service';

@Module({
  controllers: [HomeLaptopController],
  providers: [HomeLaptopService],
})
export class HomeLaptopModule {}