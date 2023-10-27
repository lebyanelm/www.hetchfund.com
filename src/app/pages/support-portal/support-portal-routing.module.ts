import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SupportPortalPage } from './support-portal.page';

const routes: Routes = [
  {
    path: '',
    component: SupportPortalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupportPortalPageRoutingModule {}
