import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectedCategoryPage } from './selected-category.page';

const routes: Routes = [
  {
    path: '',
    component: SelectedCategoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectedCategoryPageRoutingModule {}
