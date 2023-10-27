import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TwoFaVerificationCodePage } from './two-fa-verification-code.page';

const routes: Routes = [
  {
    path: '',
    component: TwoFaVerificationCodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TwoFaVerificationCodePageRoutingModule {}
