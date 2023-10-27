import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IBackendResponse } from '../interfaces/IBackendResponse';
import { IHetcher } from '../interfaces/IHetcher';
import { ToastManagerService } from './toast-manager.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  public sessionDataSubject: Subject<IHetcher> = new Subject<IHetcher>();
  public data: IHetcher;
  public sessionToken: string;
  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastManagerService
  ) {
    // Load the token from local storage when page reloads
    if (localStorage.getItem('_session')) {
      const session = JSON.parse(localStorage.getItem('_session'));
      this.setToken(session);
    }

    this.sessionDataSubject.subscribe((d) => (this.data = d));
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
}
