import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalPaymentStatusPage } from './modal-payment-status.page';

const routes: Routes = [
  {
    path: '',
    component: ModalPaymentStatusPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalPaymentStatusPageRoutingModule {}
