import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { IBackendResponse } from 'src/app/interfaces/IBackendResponse';
import { SessionService } from 'src/app/services/session.service';
import { TitleService } from 'src/app/services/title.service';
import { environment } from 'src/environments/environment';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
} from '@abacritt/angularx-social-login';
import * as superagent from 'superagent';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { RouterService } from 'src/app/services/router.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit, AfterViewInit {
  @ViewChild('EmailAddressField')
  emailAddressField: ElementRef<HTMLInputElement>;
  @ViewChild('PasswordField') passwordField: ElementRef<HTMLInputElement>;

  isLoading: boolean = false;
  errorMessage: string;
  hCaptchaToken: string;

  constructor(
    private routerService: RouterService,
    private sessionService: SessionService,
    private titleService: TitleService,
    private socialAuthService: SocialAuthService,
    private toastService: ToastManagerService,
    private loaderService: LoaderService
  ) {}
  ngOnInit() {
    this.socialAuthService.authState.subscribe((authentication) => {
      this.authorizeSocialLogin(authentication);
    });
  }

  signin() {
    // Structure the credentials data for sending.
    const credentials = {
      email_address: this.emailAddressField.nativeElement.value,
      password: this.passwordField.nativeElement.value,
      token: this.hCaptchaToken,
      is_persist: true,
    };

    // Send the credentials for confirmation.
    superagent
      .post([environment.accounts, 'authentication'].join('/'))
      .send(credentials)
      .end((_, response) => {
        if (response.statusCode == 200) {
          this.emailAddressField.nativeElement.value = '';
          this.passwordField.nativeElement.value = '';

          // Store the JWT locally for future logins.
          this.sessionService.setToken({
            uid: response.body.data.email_address,
            token: response.body.data.jwt,
          });
          this.routerService.route(['pitches']);
        } else {
          this.errorMessage = [
            response.body.reason || response.body.status_message,
            ' by ',
            response.body.cluster_pod,
            '. Please make necessary changes and try again, if error persists contact us.',
          ].join('');
        }
      });
  }

  ngAfterViewInit() {
    this.titleService.onTitleChange.next('Signin to your account — Hetchfund');
  }

  loginWithGoogleCloud() {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  loginWithFacebook() {
    this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  authorizeSocialLogin(authorization: SocialUser): Promise<null> {
    const loaderIdx = this.loaderService.showLoader();
    return new Promise((resolve, reject) => {
      superagent
        .post([environment.accounts, 'oauth', 'confirm'].join('/'))
        .send({
          display_name: authorization.name,
          email_address: authorization.email,
          profile_image: authorization.photoUrl,
          token: authorization.authToken || authorization.idToken,
          provider: authorization.provider,
        })
        .end((_, response) => {
          this.loaderService.hideLoader(loaderIdx);
          if (response) {
            if (response.statusCode === 200) {
              this.sessionService.setToken({
                uid: response.body.data.email_address,
                token: response.body.data.jwt,
              });
              this.routerService.route(['pitches']);
            } else {
              this.toastService.show(
                response.body.reason ||
                  'Something went wrong. Try again, if error persists please contact us.'
              );
            }
          } else {
            this.toastService.show("You're not connected to the internet.");
          }
        });
    });
  }

  // EVENTS THAT ARE H-CAPTCHA BASED.
  hCaptchaVerify(token: any): void {
    // WHEN VERIFICATION HAS BEEN SUCCESSFULLY COMPLETED.
    this.hCaptchaToken = token;
  }

  hCaptchaExpired(event: any): void {
    // WHEN H-CAPTCHA VERIFICATION HAS EXPIRED.
  }

  hCaptchaError(event: any): void {
    // WHEN AN ERROR OCCURS IN THE H-CAPTCHA VERIFICATION.
  }
}
