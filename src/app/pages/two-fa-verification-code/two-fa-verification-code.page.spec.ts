import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TwoFaVerificationCodePage } from './two-fa-verification-code.page';

describe('TwoFaVerificationCodePage', () => {
  let component: TwoFaVerificationCodePage;
  let fixture: ComponentFixture<TwoFaVerificationCodePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TwoFaVerificationCodePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TwoFaVerificationCodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
