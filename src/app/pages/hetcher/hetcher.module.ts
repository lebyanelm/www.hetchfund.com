import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HetcherPageRoutingModule } from './hetcher-routing.module';

import { HetcherPage } from './hetcher.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HetcherPageRoutingModule,
    ComponentsModule
  ],
  declarations: [HetcherPage]
})
export class HetcherPageModule {}
