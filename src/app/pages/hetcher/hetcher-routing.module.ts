import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HetcherPage } from './hetcher.page';

const routes: Routes = [
  {
    path: '',
    component: HetcherPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HetcherPageRoutingModule {}
