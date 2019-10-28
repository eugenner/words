import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingService } from './training.service';
import { TrainingRoutingModule } from './training-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TrainingRoutingModule
  ],
  providers: [TrainingService],
})
export class TrainingModule { }
