import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IBackendResponse } from '../interfaces/IBackendResponse';
import { IHetcher } from '../interfaces/IHetcher';
import { ToastManagerService } from './toast-manager.service';
import * as superagent from 'superagent';
import { ERROR_MESSAGES } from '../error_messages';
import { IdentityVerificationModalComponent } from '../components/identity-verification-modal/identity-verification-modal.component';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  public sessionDataSubject: Subject<IHetcher> = new Subject<IHetcher>();
  public data: IHetcher;
  public sessionToken: string;
  public generatedSmileToken: string;
  
  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastManagerService,
    private activatedRoute: ActivatedRoute
  ) {
    // Load the token from local storage when page reloads
    if (localStorage.getItem('_session')) {
      const session = JSON.parse(localStorage.getItem('_session'));
      this.setToken(session);
    }
    
    this.sessionDataSubject.subscribe((d) => {
      this.data = d;
      if (this.data?.kyc_status === "unverified" && window.location.pathname === "/pitches") {
        if (window.localStorage.getItem("sprskyc")) {
          try {
            const sprskycTimestamp = parseInt(window.localStorage.getItem("sprskyc"));
            const suppressTimeDelta = (Date.now() - sprskycTimestamp) / 3.6e+6;

            if (suppressTimeDelta > 24) {
              localStorage.removeItem("sprskyc");
              this.toastService.openModalComponentElement(IdentityVerificationModalComponent);
            }
          } catch (_){
            localStorage.removeItem("sprskyc");
            this.toastService.openModalComponentElement(IdentityVerificationModalComponent);
          }
        } else {
          this.toastService.openModalComponentElement(IdentityVerificationModalComponent);
        }
      }
    });
  }

  // Sets session token and retrieves data from the backend about the hetcher.
  setToken(session: { uid?: string; token: string }) {
    this.sessionToken = session.token;

    // Store the session token via LocalStorage.
    localStorage.setItem('_session', JSON.stringify(session));
    this.getSessionData();
  }

  getSessionData() {
    this.http
      .get([environment.accounts, 'authentication', 're'].join('/'), {
        headers: {
          Authorization: 'Bearer ' + this.sessionToken,
        },
      })
      .subscribe((response: IBackendResponse<any>) => {
        console.log(response)
        if (response.status_code == '200') {
          this.data = response.data;
          this.sessionDataSubject.next(response.data);
        } else {
          this.toastService.show(
            ['Something went wrong.', response.status_message].join(' ')
          );
        }
      });
  }

  updateSessionData(data: IHetcher) {
    this.sessionDataSubject.next(data);
  }

  removeSession() {
    this.toastService.show('Signing you out...');

    // Remove user related data
    this.sessionDataSubject.next(null);
    this.sessionToken = null;
    localStorage.removeItem('_session');
    localStorage.removeItem('_default_currency');

    // Route the user out to the sign in page
    this.router.navigate(['signin']);
  }

  startRealPersonVerification() {
    this.toastService.openBrowserPopup(this.getKYCUrl());
  }

  suppressRealPersonVerification() {
    window.localStorage.setItem('sprskyc', Date.now().toString());
  }

  getKYCUrl() {
    return environment.frontend + '/kyc/verifications?uid=' + this.data?._id;
  }
}
