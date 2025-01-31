import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateReviewPageRoutingModule } from './create-review-routing.module';

import { CreateReviewPage } from './create-review.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateReviewPageRoutingModule,
    ComponentsModule
  ],
  declarations: [CreateReviewPage]
})
export class CreateReviewPageModule {}
