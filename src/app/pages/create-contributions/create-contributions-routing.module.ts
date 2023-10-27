import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateContributionsPage } from './create-contributions.page';

const routes: Routes = [
  {
    path: '',
    component: CreateContributionsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateContributionsPageRoutingModule {}
