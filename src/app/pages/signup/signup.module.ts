import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignupPageRoutingModule } from './signup-routing.module';

import { SignupPage } from './signup.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { NgHcaptchaModule } from 'ng-hcaptcha';
import { environment } from 'src/environments/environment';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignupPageRoutingModule,
    ComponentsModule,
    GoogleSigninButtonModule,
    NgHcaptchaModule.forRoot({
      siteKey: environment.H_CAPTCHA_SITEKEY,
    }),
  ],
  declarations: [SignupPage]
})
export class SignupPageModule {}
