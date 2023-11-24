import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterService } from 'src/app/services/router.service';
import { SessionService } from 'src/app/services/session.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';

@Component({
  selector: 'app-two-fa-verification-code',
  templateUrl: './two-fa-verification-code.page.html',
  styleUrls: ['./two-fa-verification-code.page.scss'],
})
export class TwoFaVerificationCodePage implements OnInit {
  accepted_token = null;

  status = null;
  title = null;
  message = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private routerService: RouterService,
    private sessionService: SessionService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.accepted_token = params.get('token');
      superagent
        .get(
          [
            environment.accounts,
            'verifications/2fa/token',
            this.accepted_token,
          ].join('/')
        )
        .end((_, response) => {
          if (response) {
            if (response.statusCode === 200) {
              this.status = true;
              this.title = 'Account verified';
              this.message =
                "Your account has been verified. You can continue to the next page, if page does not load automatically tap the 'Manually Continue' button below.";

              // Set the new session token.
              this.sessionService.setToken({
                token: response.body.data.session_token,
              });

              // Automatically redirect after 5s (seconds).
              setTimeout(() => {
                this.continue();
              }, 5000);
            } else if (response.statusCode === 400) {
              this.status = false;
              this.title = response.body.message || 'Verification failed';
              this.message = response.body.reason;
            } else {
              this.status = false;
              this.title = response.body.message;
              this.message = response.body.reason;
            }
          } else {
            this.status = false;
            this.title = "You're not connected to the internet";
            this.message =
              'Seems your internet connection is faulty. Please fix the issue and retry the verification.';
          }
        });
    });
  }

  continue() {
    this.routerService.route(['pitches']);
  }

  retryVerification() {
    // As a form of retrying a verification, reload the page.
    window.location.reload();
  }
}
