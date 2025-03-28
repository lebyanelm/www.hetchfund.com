import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContributionDetailsPage } from './contribution-details.page';

const routes: Routes = [
  {
    path: '',
    component: ContributionDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContributionDetailsPageRoutingModule {}
