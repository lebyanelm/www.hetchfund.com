import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ERROR_MESSAGES } from 'src/app/error_messages';
import { RouterService } from 'src/app/services/router.service';
import { SessionService } from 'src/app/services/session.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.page.html',
  styleUrls: ['./email-verification.page.scss'],
})
export class EmailVerificationPage implements OnInit {

  hetcherId = null;
  constructor(private activatedRoute: ActivatedRoute, private router: RouterService, private toastService: ToastManagerService, private sessionService: SessionService, private routerService: RouterService) { }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe((queryParamMap) => {
      this.hetcherId = atob(queryParamMap.get("hid"));
      console.log(this.hetcherId)
    })
  }

  verifyCode(code) {
    if (this.hetcherId) {
      superagent
        .get([environment.accounts, 'verifications', '2fa', 'code', code, this.hetcherId].join('/'))
        .end((_, response) => {
          if (response) {
            if (response.statusCode === 200) {
              // Store the JWT locally for future logins.
              this.sessionService.setToken({
                uid: this.hetcherId,
                token: response.body.data.session_token,
              });
              this.routerService.route(['pitches']);
            } else {
              this.toastService.show(response.body.reason || ERROR_MESSAGES.UNEXPECTED_ERROR);
            }
          } else {
            this.toastService.show(ERROR_MESSAGES.NO_INTERNET);
          }
        })
    } else {
      this.toastService.show("Something is wrong with the verification. Please start the signin process again.");
    }
  } 
}
