import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChoosePledgeOptionsPageRoutingModule } from './choose-pledge-options-routing.module';

import { ChoosePledgeOptionsPage } from './choose-pledge-options.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChoosePledgeOptionsPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [ChoosePledgeOptionsPage],
})
export class ChoosePledgeOptionsPageModule {}
