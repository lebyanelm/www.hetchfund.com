import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalPaymentStatusPage } from './modal-payment-status.page';

describe('ModalPaymentStatusPage', () => {
  let component: ModalPaymentStatusPage;
  let fixture: ComponentFixture<ModalPaymentStatusPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ModalPaymentStatusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
