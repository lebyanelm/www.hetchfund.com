import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChoosePaymentMethodPage } from './choose-payment-method.page';

const routes: Routes = [
  {
    path: '',
    component: ChoosePaymentMethodPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChoosePaymentMethodPageRoutingModule {}
