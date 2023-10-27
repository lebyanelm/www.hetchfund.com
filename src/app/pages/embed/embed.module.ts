import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmbedPageRoutingModule } from './embed-routing.module';

import { EmbedPage } from './embed.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmbedPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [EmbedPage],
})
export class EmbedPageModule {}
