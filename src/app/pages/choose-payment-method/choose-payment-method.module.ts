import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChoosePaymentMethodPageRoutingModule } from './choose-payment-method-routing.module';

import { ChoosePaymentMethodPage } from './choose-payment-method.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    ChoosePaymentMethodPageRoutingModule,
  ],
  declarations: [ChoosePaymentMethodPage],
})
export class ChoosePaymentMethodPageModule {}
