import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContributionHistoryPageRoutingModule } from './contribution-history-routing.module';

import { ContributionHistoryPage } from './contribution-history.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    ContributionHistoryPageRoutingModule,
  ],
  declarations: [ContributionHistoryPage],
})
export class ContributionHistoryPageModule {}
