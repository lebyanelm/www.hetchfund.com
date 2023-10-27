import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContributionDetailsPageRoutingModule } from './contribution-details-routing.module';

import { ContributionDetailsPage } from './contribution-details.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    ContributionDetailsPageRoutingModule,
  ],
  declarations: [ContributionDetailsPage],
})
export class ContributionDetailsPageModule {}
