import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TwoFaVerificationCodePageRoutingModule } from './two-fa-verification-code-routing.module';

import { TwoFaVerificationCodePage } from './two-fa-verification-code.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TwoFaVerificationCodePageRoutingModule
  ],
  declarations: [TwoFaVerificationCodePage]
})
export class TwoFaVerificationCodePageModule {}
