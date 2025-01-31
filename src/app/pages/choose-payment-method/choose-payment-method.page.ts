import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ERROR_MESSAGES } from 'src/app/error_messages';
import { CurrencyResolverService } from 'src/app/services/currency-resolver.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SessionService } from 'src/app/services/session.service';
import { TitleService } from 'src/app/services/title.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import uniqid from 'uniqid';
import * as superagent from 'superagent';
import { EggService } from 'src/app/services/egg.service';
import { RouterService } from 'src/app/services/router.service';
import { INowPaymentsInvoice, INowPaymentsPayment } from 'src/app/interfaces/INowPaymentsResponses';
import queryString from 'query-string';


// Declare missing types
declare var window: any;
declare const paypal;


@Component({
  selector: 'app-choose-payment-method',
  templateUrl: './choose-payment-method.page.html',
  styleUrls: ['./choose-payment-method.page.scss'],
})
export class ChoosePaymentMethodPage implements OnInit {
  // Company details
  pitchKey: string;
  pitchName: string;

  rewardId: string;
  reward: any;
  contributionAmount: any;
  translatedAmount: number;
  usdContributionAmount: number;

  supaChargeAmount: number = 0;
  translatedSupachargeAmount: number = 0;
  usdSupaChargeAmount: number = 0;

  MINIMUM_AMOUNT:number = 15;

  yoco = new window.YocoSDK({
    publicKey: environment.YOCO_PUBLIC_KEY,
  });

  coinbaseWindow: Window;

  // Method of payment previously selected when confirming contribution
  paymentSource: string = 'paypal';

  contributionOptions = [];

  isAwaitCoinbaseWindow: boolean;
  isCustomAmount = false;

  constructor(
    private titleService: TitleService,
    public currencyService: CurrencyResolverService,
    public sessionService: SessionService,
    private activatedRoute: ActivatedRoute,
    private routerService: RouterService,
    private pitchService: EggService,
    public toastService: ToastManagerService,
    private loaderService: LoaderService
  ) {}

  ngOnInit() {
    const loaderIdx = this.loaderService.showLoader();
    
    this.titleService.onTitleChange.next(
      'Choose a contribution method | Hetchfund.com'
    );

    // Listen to currency changes.
    let currentCurrencyCode = this.currencyService.currency?.code;
    this.currencyService.currency_state.subscribe((newCurrency) => {
      if (newCurrency.code !== currentCurrencyCode) {
        if (this.isCustomAmount) {
          this.currencyService
          .translateTo(
            this.contributionAmount,
            currentCurrencyCode,
            newCurrency.code
          )
          .then((newCustomContributionAmount) => {
            this.contributionAmount = newCustomContributionAmount;
            currentCurrencyCode = newCurrency.code;
          });
        }
      }
    });

    this.activatedRoute.paramMap.subscribe((params) => {
      this.pitchKey = params.get('pitch_key');

      // GET THE REWARDS OF THE CONTRACT.
      this.pitchService
        .getRewards(this.pitchKey)
        .then((contributionOptions: any) => {
          this.contributionOptions = contributionOptions?.reward_options;

          // GET THE CUSTOM COMMITMENT AMOUNT IF EXISTS:
          this.activatedRoute.queryParamMap.subscribe((params) => {
            const customContributionAmount = params.get('custom');
            this.rewardId = params.get('id');
            this.pitchName = params.get('name');

            if (this.rewardId === '') {
              this.contributionAmount = parseFloat(
                customContributionAmount
              );
              this.isCustomAmount = true;
            } else {
              this.reward = this.contributionOptions.find(
                (_reward) => _reward.id === this.rewardId
              );
              this.contributionAmount = this.reward.contribution_amount;
            }

            this.currencyService
              .translateTo(
                this.contributionAmount,
                this.isCustomAmount == true
                  ? this.currencyService.currency.code
                  : "ZAR",
                "ZAR"
              )
              .then((translatedAmount: number) => {
                // AMOUNT TO BE USED FOR SETTLEMENT AND YOCO:
                this.translatedAmount = translatedAmount + this.supaChargeAmount;
                if (this.translatedAmount < this.MINIMUM_AMOUNT) {
                  this.toastService.show("Amount less than minimum, your contribution amount has been converted to the minimum amount.", true, true);
                  this.translatedAmount = this.MINIMUM_AMOUNT;
                  this.contributionAmount = this.translatedAmount / this.currencyService.currency.exchange_rate;
                }

                // REWARD SELECTION, IF CUSTOM AMOUNT:
                if (!this.rewardId) {
                  if (this.contributionOptions?.length) {
                    let previousSelectedAmount = 0;
                    for (let i = 0; i <= this.contributionOptions.length - 1; i++) {
                      if (this.translatedAmount >= this.contributionOptions[i].contribution_amount) {
                        if (this.contributionOptions[i].contribution_amount > previousSelectedAmount) {
                          this.reward = this.contributionOptions[i];
                          previousSelectedAmount = this.contributionOptions[i].contribution_amount;
                        }
                      }
                    }
                  }
                }

                // Convert it to USD for paypal / coinbase payments
                this.currencyService
                  .translateTo(this.translatedAmount, 'ZAR', 'USD')
                  .then((usdContributionAmount: number) => {
                    this.usdContributionAmount = usdContributionAmount + this.usdSupaChargeAmount;
                    this.loaderService.hideLoader(loaderIdx);
                    this.initPayPalButton();
                  }).catch((error) => {
                    this.loaderService.hideLoader(loaderIdx);
                    console.log(error);
                  });
              });
          });
        });
    });
  }

  initPayPalButton() {
    const paypalButtonsComponent = paypal.Buttons({
      // optional styling for buttons
      // https://developer.paypal.com/docs/checkout/standard/customize/buttons-style-guide/
      style: {
        color:    'blue',
        shape:    'rect',
        layout:   'horizontal',
        label:    'paypal',
        tagline:   false,
      },

      // set up the transaction
      createOrder: (data, actions) => {
        this.paymentSource = 'paypal';

        // pass in any options from the v2 orders create call:
        // https://developer.paypal.com/api/orders/v2/#orders-create-request-body
        const createOrderPayload = {
          purchase_units: [
            {
              amount: {
                value: Math.round(
                  (this.usdContributionAmount + this.usdSupaChargeAmount + Number.EPSILON) * 100
                ) / 100,
                currency: this.currencyService.currency.code,
              },
              invoice_id: uniqid(this.paymentSource + '-').toUpperCase(),
              custom_id: this.sessionService.data?.email_address || 'N/A',
            },
          ],
        };

        return actions.order.create(createOrderPayload);
      },

      // finalize the transaction
      onApprove: (data, actions) => {
        const captureOrderHandler = (details) => {
          // Send the capture to finalize the contribution
          this.confirmContribution({
            id: details.purchase_units[0].invoice_id,
            hetcher: {
              id: details.payer.email_address,
              name: details.purchase_units[0].shipping.name.full_name,
            },
            rewards_address: details.purchase_units[0].shipping.address,
            paypal_capture_id: details.purchase_units[0].payments.captures[0].id,
            status:
              details.purchase_units[0].payments.captures[0].status.toLowerCase(),
            source: "paypal"
          });
        };

        return actions.order.capture().then(captureOrderHandler);
      },

      // handle unrecoverable errors
      onError: (err) => {
        this.toastService.show(
          'An error prevented the buyer from checking-out with PayPal.', true, true
        );
        console.log(err);
      },
    });

    paypalButtonsComponent.render('#paypal-button-container').catch((err) => {
      this.toastService.show('PayPal Buttons failed to render', true, true);
      console.log(err);
    });
  }

  // Round off digits to the nearest 2 decimal places
  round(number: number) {
    return Math.round(number * 100) / 100;
  }

  // Complete the contribution by sending it to the Farmhouse for comfirmation
  confirmContribution(data) {
    const loaderIdx = this.loaderService.showLoader();
    
    const contribution = {
      charge_id: data.id || null,
      paypal_capture_id: data.paypal_capture_id,
      key: uniqid([this.paymentSource, '-'].join('')).toUpperCase(),
      
      payer: data.hetcher
        ? data.hetcher
        : this.sessionService?.data?.email_address,
        
      payment_source: data.source,
      payment_method: data.payment_method,

      amount: this.translatedAmount + this.translatedSupachargeAmount,
      amount_in_currency: this.translatedAmount * this.currencyService.currency.exchange_rate + this.supaChargeAmount,

      supacharge: this.supaChargeAmount / this.currencyService.currency.exchange_rate,
      supacharge_in_currency: this.supaChargeAmount,

      currency: data.currency || this.currencyService.currency.code,
      currency_symbol: data.currency_symbol || this.currencyService.currency.symbol,

      pitch_key: this.pitchKey,
      pitch_name: this.pitchName,
      reward_name: this.reward?.name,

      status: data.status,
    };

    // Check if the payment was actually accepted.
    if (contribution.payment_source === 'paypal_buttons') {
      if (contribution.status !== 'completed') {
        return this.toastService.show(
          'Somehow the payment failed, please check if you were charged before trying again. Report this if it occurs again.', true, true
        );
      }
    }

    // Send the contribution information to the backend
    const contributionRequest = superagent.post(
      [environment.farmhouse, 'contribution'].join('/')
    );

    // Check if there is a session available to link the contribution with
    if (this.sessionService.sessionToken) {
      contributionRequest.set(
        'Authorization',
        ['Bearer', this.sessionService.sessionToken].join(' ')
      );
    }

    contributionRequest.send(contribution).end((_, response) => {
      this.loaderService.hideLoader(loaderIdx);

      if (response) {
        if (response.statusCode === 200) {
          this.routerService.route(['pitches', this.pitchKey, 'contribution', 'callbacks', 'success?cid=' + contribution.key]);
        } else {
          this.routerService.route(['pitches', this.pitchKey, 'contribution', 'callbacks', 'error?emsg=' + btoa(response.body.reason)]);
        }
      } else {
        this.toastService.show(ERROR_MESSAGES.NO_INTERNET, true, true);
      }
    });
  }

  openYocoPopup(URI) {
    this.paymentSource = 'yoco';
    const openPopup = (amount: number) => {
      const contributionAmountInCents = amount * 100;

      this.yoco.showPopup({
        amountInCents: contributionAmountInCents,
        currency: 'ZAR',
        name: ['Giving forward to:', this.pitchName].join(' '),
        description: 'Contribution made through Yoco to Hetchfund.com',
        metadata: {
          pitch: this.pitchKey,
          hetcher: this.sessionService.data?.email_address
        },
        callback: (result) => {
          if (result.error) {
            const errorMessage = result.error.message;
            this.toastService.show(
              ['An error occured:', errorMessage].join(' ')
            );
          } else {
            const loaderIdx = this.loaderService.showLoader();

            const tokenizedId = result.id;

            const yocoChargeRequest = superagent.post(
              [environment.farmhouse, 'contribution/yoco', tokenizedId].join(
                '/'
              )
            );

            // Attach authentication key to it incase there's an active session.
            if (this.sessionService.sessionToken) {
              yocoChargeRequest.set(
                'Authorization',
                ['Bearer', this.sessionService.sessionToken].join(' ')
              );
            }

            // Send the Tokenized ID to the back end to process the payment with a secret key and Yoco Charge API.
            yocoChargeRequest
              .send({
                amountInCents: contributionAmountInCents,
                currency: 'ZAR',
              })
              .end((_, response) => {
                this.loaderService.hideLoader(loaderIdx);
                if (response) {
                  if (response.statusCode === 200) {
                    this.confirmContribution({
                      id: response.body.data.id,
                      currency: 'ZAR',
                      currency_symbol: "R",
                      status: response.body.data.status,
                      payment_method: response.body.data.payment_method,
                      source: "yoco"
                    });
                  } else {
                    this.toastService.show(
                      response.body?.reason || ERROR_MESSAGES.UNEXPECTED_ERROR, true, true
                    );
                  }
                } else {
                  this.toastService.show(ERROR_MESSAGES.NO_INTERNET, true, true);
                }
              });
          }
        },
      });
    };

    openPopup(this.translatedAmount + this.translatedSupachargeAmount);
  }

  setSuperchargeAmount(supaChargeAmount: number): void {
    if (this.supaChargeAmount !== 0) {
      // Subtract the current set supa-charge amount to prevent double amounts.
      this.translatedAmount -= this.supaChargeAmount;

      if (this.supaChargeAmount === supaChargeAmount) {
        this.supaChargeAmount = 0;
        return;
      }
    }
    
    this.supaChargeAmount = supaChargeAmount;
    
    // Also setup the USD supa-charge amount.
    this.currencyService
      .translateTo(this.supaChargeAmount, this.currencyService.currency.code, 'USD')
      .then(
        (usdSupaChargeAmount: number) =>
          (this.usdSupaChargeAmount = usdSupaChargeAmount)
      );


    // In case user uses a different currency from ZAR,
    // convert the supacharge amount to ZAR for settlement purposes.
    this.currencyService
      .translateTo(this.supaChargeAmount, this.currencyService.currency.code, "ZAR")
      .then((zarSuparchargeAmount: number) => {
        this.translatedSupachargeAmount = zarSuparchargeAmount;
      });
  }
}
