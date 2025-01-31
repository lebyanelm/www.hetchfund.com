import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalPaymentStatusPageRoutingModule } from './modal-payment-status-routing.module';

import { ModalPaymentStatusPage } from './modal-payment-status.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalPaymentStatusPageRoutingModule
  ],
  declarations: [ModalPaymentStatusPage]
})
export class ModalPaymentStatusPageModule {}
