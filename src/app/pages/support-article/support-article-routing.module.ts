import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SupportArticlePage } from './support-article.page';

const routes: Routes = [
  {
    path: '',
    component: SupportArticlePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupportArticlePageRoutingModule {}
