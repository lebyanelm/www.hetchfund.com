import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContributionCompletedPage } from './contribution-completed.page';

const routes: Routes = [
  {
    path: '',
    component: ContributionCompletedPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContributionCompletedPageRoutingModule {}
