import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SupportArticlePageRoutingModule } from './support-article-routing.module';

import { SupportArticlePage } from './support-article.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SupportArticlePageRoutingModule,
    ComponentsModule,
  ],
  declarations: [SupportArticlePage],
})
export class SupportArticlePageModule {}
