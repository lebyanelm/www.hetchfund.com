import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EggCampaignPage } from './egg-campaign.page';

const routes: Routes = [
  {
    path: '',
    component: EggCampaignPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EggCampaignPageRoutingModule {}
