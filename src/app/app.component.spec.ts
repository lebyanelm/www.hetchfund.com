import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
  // TODO: add more tests!
});

// <a
//           [href]="'/hetcher/' + this.sessionService.data?.username"
//           *ngIf="this.sessionService.sessionToken"
//           >Your profile</a
//         >
//         <a href="/history/view" *ngIf="this.sessionService.sessionToken"
//           >Your browsing history</a
//         >
//         <a href="/history/contribution" *ngIf="this.sessionService.sessionToken"
//           >Contribution history</a
//         >
//         <a href="/successful-pitches">Our sponsors</a>
//         <a href="/about">About</a>
//         <a href="/settings">Settings</a>
//         <a
//           class="signout"
//           *ngIf="this.sessionService.sessionToken"
//           (click)="this.signout()"
//           >Signout and remove session</a
//         >
//         <a
//           class="signout"
//           *ngIf="!this.sessionService.sessionToken"
//           href="/signin"
//           >Log in to your account</a
//         >
