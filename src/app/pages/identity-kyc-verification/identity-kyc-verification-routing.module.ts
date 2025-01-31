import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IdentityKycVerificationPage } from './identity-kyc-verification.page';

const routes: Routes = [
  {
    path: '',
    component: IdentityKycVerificationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IdentityKycVerificationPageRoutingModule {}
