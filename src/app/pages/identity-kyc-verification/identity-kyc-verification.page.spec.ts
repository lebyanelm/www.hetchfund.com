import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IdentityKycVerificationPage } from './identity-kyc-verification.page';

describe('IdentityKycVerificationPage', () => {
  let component: IdentityKycVerificationPage;
  let fixture: ComponentFixture<IdentityKycVerificationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(IdentityKycVerificationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
