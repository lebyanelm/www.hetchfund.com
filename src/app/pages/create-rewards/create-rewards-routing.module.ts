import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateRewardsPage } from './create-rewards.page';

const routes: Routes = [
  {
    path: '',
    component: CreateRewardsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateRewardsPageRoutingModule {}
