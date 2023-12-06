import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { Injectable } from '@angular/core';
import { ToastManagerService } from './toast-manager.service';
import { LoaderService } from './loader.service';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
} from '@abacritt/angularx-social-login';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';
import { RouterService } from './router.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class SocialLoginService {
  constructor(
    private socialAuthService: SocialAuthService,
    private toastService: ToastManagerService,
    private loaderService: LoaderService,
    private routerService: RouterService,
    private sessionService: SessionService,
  ) {
    this.socialAuthService.authState.subscribe((authentication) => {
      this.authorizeSocialLogin(authentication);
    });
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
}
