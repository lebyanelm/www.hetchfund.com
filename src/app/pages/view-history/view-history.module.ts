import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewHistoryPageRoutingModule } from './view-history-routing.module';

import { ViewHistoryPage } from './view-history.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewHistoryPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [ViewHistoryPage],
})
export class ViewHistoryPageModule {}
