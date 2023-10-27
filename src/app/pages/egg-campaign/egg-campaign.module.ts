import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EggCampaignPageRoutingModule } from './egg-campaign-routing.module';

import { EggCampaignPage } from './egg-campaign.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EggCampaignPageRoutingModule,
    ComponentsModule
  ],
  declarations: [EggCampaignPage]
})
export class EggCampaignPageModule {}
