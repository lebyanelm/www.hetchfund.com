import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  isValid,
  isExpirationDateValid,
  isSecurityCodeValid,
  getCreditCardNameByNumber,
} from 'creditcard.js';
import { ERROR_MESSAGES } from 'src/app/error_messages';
import { ICard } from 'src/app/interfaces/ICard';
import { IPaymentResponse } from 'src/app/interfaces/IPaymentResponse';
import { CurrencyResolverService } from 'src/app/services/currency-resolver.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SessionService } from 'src/app/services/session.service';
import { TitleService } from 'src/app/services/title.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';
import * as random from 'random-words';

console.log();

@Component({
  selector: 'app-add-payment-method',
  templateUrl: './add-payment-method.page.html',
  styleUrls: ['./add-payment-method.page.scss'],
})
export class AddPaymentMethodPage implements OnInit, AfterViewInit {
  @ViewChild('CardName') name: ElementRef<HTMLInputElement>;
  @ViewChild('CardNumber') number: ElementRef<HTMLInputElement>;
  @ViewChild('CardExpiry') expiry: ElementRef<HTMLInputElement>;
  @ViewChild('SecurityCode') securityCode: ElementRef<HTMLInputElement>;
  @ViewChild('InvisibleField') invisbleField: ElementRef<HTMLInputElement>;
  @ViewChild('DefaultMethodCheck')
  defaultMethodCheckbox: ElementRef<HTMLInputElement>;

  holderError = '';
  numberError = '';
  expError = '';
  cvvError = '';
  responseError = '';

  card: ICard;
  isNumberValid = false;
  isExpYearValid = false;
  isExpMonthValid = false;
  isSameYear = false;

  payment_method;

  contributionKey: string;
  contributionIndex: number;
  contributionAmount: number = 0.01;
  contributionOptions = [
    {
      contribution_amount: 10,
      rewards_description: "You'll earn +1 points of hetcher reputation.",
      index: 0,
    },
    {
      contribution_amount: 20,
      rewards_description: "You'll earn +2 points of hetcher reputation.",
      index: 1,
    },
    {
      contribution_amount: 30,
      rewards_description: "You'll earn +3 points of hetcher reputation.",
      index: 2,
    },
    {
      contribution_amount: 40,
      rewards_description: "You'll earn +4 points of hetcher reputation.",
      index: 3,
    },
  ];

  constructor(
    private titleService: TitleService,
    private sessionService: SessionService,
    private loaderService: LoaderService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastManagerService,
    private currencyResolver: CurrencyResolverService
  ) {
    this.titleService.onTitleChange.next('Add a payment method | Hetchfund');
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe((params) => {});
  }

  ngAfterViewInit() {}

  verifyCardAndPayContribution() {
    // this.loaderService.showLoader()
    this.resetErrors();

    this.card = {
      holder: this.name.nativeElement.value,
      number: this.number.nativeElement.value,
      exp_month: this.expiry.nativeElement.value?.split('/')?.[1],
      exp_year: this.expiry.nativeElement.value?.split('/')?.[0],
      cvv: this.securityCode.nativeElement.value,
      amount: this.contributionAmount,
      payment_brand: 'visa',
      invisible_field: this.invisbleField.nativeElement.value,
      for_pitch: this.contributionKey,
    };

    console.log(this.card);

    // Verify the payment method holder
    if (!this.card.holder) {
      this.holderError = 'Card holder name needs to have a value.';
    }

    // Check the card number
    const isNumberValid = isValid(this.card.number);
    if (!isNumberValid) {
      this.numberError = 'Invalid card number provided.';
    }

    // Check the expiry date of the card
    const currentDate = new Date(),
      currentMonth = currentDate.getMonth(),
      currentYear = currentDate.getFullYear();

    // Firstly start with the expiry month
    const exp_year = parseInt(this.card.exp_year);
    if (exp_year >= currentYear) {
      this.isExpYearValid = true;
      if (currentYear == exp_year) {
        this.isSameYear = true;
      }
    }

    const exp_month = parseInt(this.card.exp_month);
    if (
      (this.isSameYear && exp_month > currentMonth) ||
      (!this.isSameYear && this.isExpYearValid)
    ) {
      this.isExpMonthValid = true;
    } else {
      this.expError = 'Invalid expiration date provided.';
    }

    // Check the CVV number
    if (
      !(
        this.card.cvv.length >= 3 &&
        this.card.cvv.length <= 4 &&
        parseInt(this.card.cvv) !== NaN
      )
    ) {
      this.cvvError = 'Invalid security code provided.';
    }

    // Send the payment details to verify functionality by charging R1
    if (
      !this.holderError &&
      !this.numberError &&
      !this.expError &&
      !this.cvvError
    ) {
      this.saveCard();
    }
  }

  resetErrors() {
    this.holderError = '';
    this.numberError = '';
    this.expError = '';
    this.cvvError = '';
    this.responseError = '';
  }
}
