import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChooseInterestsPage } from './choose-interests.page';

const routes: Routes = [
  {
    path: '',
    component: ChooseInterestsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChooseInterestsPageRoutingModule {}
