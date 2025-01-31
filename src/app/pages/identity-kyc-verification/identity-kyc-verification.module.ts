import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IdentityKycVerificationPageRoutingModule } from './identity-kyc-verification-routing.module';

import { IdentityKycVerificationPage } from './identity-kyc-verification.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IdentityKycVerificationPageRoutingModule
  ],
  declarations: [IdentityKycVerificationPage]
})
export class IdentityKycVerificationPageModule {}
