import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateCuratorsPage } from './create-curators.page';

const routes: Routes = [
  {
    path: '',
    component: CreateCuratorsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateCuratorsPageRoutingModule {}
