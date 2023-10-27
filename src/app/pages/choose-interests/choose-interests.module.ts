import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChooseInterestsPageRoutingModule } from './choose-interests-routing.module';

import { ChooseInterestsPage } from './choose-interests.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChooseInterestsPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [ChooseInterestsPage],
})
export class ChooseInterestsPageModule {}
