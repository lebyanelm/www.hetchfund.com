import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateMilestonesPage } from './create-milestones.page';

const routes: Routes = [
  {
    path: '',
    component: CreateMilestonesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateMilestonesPageRoutingModule {}
