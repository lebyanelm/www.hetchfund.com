import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateDocumentationPage } from './create-documentation.page';

const routes: Routes = [
  {
    path: '',
    component: CreateDocumentationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateDocumentationPageRoutingModule {}
