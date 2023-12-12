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
  customContributionAmount: any;

  supaChargeAmount: number = 0;
  usdSupaChargeAmount: number = 0;

  yoco = new window.YocoSDK({
    publicKey: environment.YOCO_PUBLIC_KEY,
  });

  // Method of payment previously selected when confirming contribution
  paymentSource: string = 'paypal';

  contributionOptions = [];

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
      'Choose a contribution method | Hetchfund'
    );

    // Listen to currency changes.
    let currentCurrencyCode = this.currencyService.currency?.code;
    this.currencyService.currency_state.subscribe((newCurrency) => {
      if (newCurrency.code !== currentCurrencyCode) {
        this.currencyService
          .translateTo(
            this.customContributionAmount,
            currentCurrencyCode,
            newCurrency.code
          )
          .then((newCustomContributionAmount) => {
            this.customContributionAmount = newCustomContributionAmount;
            currentCurrencyCode = newCurrency.code;
          });
      }
    });

    this.activatedRoute.paramMap.subscribe((params) => {
      this.pitchKey = params.get('pitch_key');

      // GET THE REWARDS OF THE CONTRACT.
      this.pitchService
        .getRewards(this.pitchKey)
        .then((contributionOptions: any) => {
          this.contributionOptions = contributionOptions?.reward_options;

          // GET THE CUSTOM COMMITMENT AAMOUNT IF EXISTS.
          this.activatedRoute.queryParamMap.subscribe((params) => {
            this.rewardId = params.get('id');
            this.customContributionAmount = params.get('custom');
            this.pitchName = params.get('name');

            if (this.rewardId === '') {
              this.contributionAmount = parseFloat(
                this.customContributionAmount
              );
            } else {
              this.reward = this.contributionOptions.find(
                (_reward) => _reward.id === this.rewardId
              );
              this.contributionAmount = this.reward.contribution_amount;
            }

            this.currencyService
              .translateTo(
                this.contributionAmount,
                this.contributionAmount == this.customContributionAmount
                  ? this.currencyService.currency.code
                  : 'ZAR',
                'ZAR'
              )
              .then((translatedAmount: number) => {
                this.translatedAmount = translatedAmount;

                // Choose the appropriate reward if contribution is custom.
                if (!this.rewardId) {
                  if (this.contributionOptions?.length) {
                    for (
                      let i = 0;
                      i <= this.contributionOptions.length - 1;
                      i++
                    ) {
                      console.log(
                        this.contributionOptions[i].contribution_amount,
                        this.translatedAmount
                      );
                      if (
                        this.translatedAmount >=
                        this.contributionOptions[i].contribution_amount
                      ) {
                        this.reward = this.contributionOptions[i];
                      }
                    }
                  }
                }

                // Convert it to USD for paypal / coinbase payments
                this.currencyService
                  .translateTo(this.translatedAmount, 'ZAR', 'USD')
                  .then((usdContributionAmount: number) => {
                    this.usdContributionAmount = usdContributionAmount;

                    this.initPayPalButton();
                    this.loaderService.hideLoader(loaderIdx);
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
        this.paymentSource = 'paypal_buttons';

        // pass in any options from the v2 orders create call:
        // https://developer.paypal.com/api/orders/v2/#orders-create-request-body
        const createOrderPayload = {
          purchase_units: [
            {
              amount: {
                value: Math.round(
                  this.usdContributionAmount + this.usdSupaChargeAmount
                ),
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
            amount: this.translatedAmount,

            status:
              details.purchase_units[0].payments.captures[0].status.toLowerCase(),
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
      key: uniqid([this.paymentSource, '-'].join('')).toUpperCase(),
      payer: data.hetcher
        ? data.hetcher
        : this.sessionService?.data?.email_address,
      payment_source: this.paymentSource,
      payment_method: data.payment_method,

      amount: data.amount || this.translatedAmount,
      amount_in_currency:
        this.contributionAmount !== this.customContributionAmount
          ? this.contributionAmount *
            this.currencyService.currency.exchange_rate
          : parseFloat(this.customContributionAmount),

      currency: this.currencyService.currency.code,
      currency_symbol: this.currencyService.currency.symbol,

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
          const a = document.createElement('a');
          a.href = `/pitches/${contribution.pitch_key}/contribution/completed?contribution_id=${contribution.key}`;
          a.click();
        } else {
          this.toastService.show(
            response.body.reason || ERROR_MESSAGES.UNEXPECTED_ERROR, true, true
          );
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
        name: ['Giving forward to', this.pitchName].join(' '),
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
                      amount: this.translatedAmount,
                      currency: 'ZAR', // SINCE MONEY IS STORED IN 'ZAR',
                      status: response.body.data.status,
                      payment_method: response.body.data.payment_method,
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

    if (this.customContributionAmount !== '0') {
      this.currencyService
        .translateTo(
          parseFloat(this.customContributionAmount) + this.supaChargeAmount,
          this.currencyService.currency.code,
          'ZAR'
        )
        .then((yocoZARAmount: number) => {
          openPopup(yocoZARAmount);
        });
    } else {
      this.currencyService
        .translateTo(
          this.supaChargeAmount,
          this.currencyService.currency.code,
          'ZAR'
        )
        .then((zarSupaChargeAmount: number) => {
          openPopup(this.translatedAmount);
        });
    }
  }

  // Create a coinbase commerce charge to be used for the payment.
  createCoinbaseCharge() {
    this.paymentSource = 'coinbase';
    const loaderIdx = this.loaderService.showLoader();

    const createChargeRequest = superagent.post(
      'https://api.commerce.coinbase.com/charges/'
    );

    createChargeRequest
      .set('X-CC-Api-Key', environment.COINBASE_API_KEY)
      .set('X-CC-Version', '2018-03-22')
      .send({
        name: this.pitchName.split('').splice(0, 97).join('') + '...',
        description: 'Contribution made through Coinbase to Hetchfund.com',
        pricing_type: 'fixed_price',
        local_price: {
          amount: this.usdContributionAmount + this.usdSupaChargeAmount,
          currency: 'USD',
        },
        metadata: {
          customer_id: this.sessionService.data?.email_address,
          pitch_key: this.pitchKey,
        },
        logo_url:
          'data:image/png;base64,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',
        redirect_url:
          'https://localhost:8100/pitches/support-my-new-ep:-c---GW_QkhqImp',
        cancel_url:
          'https://localhost:8100/pitches/support-my-new-ep:-c---GW_QkhqImp/contribution/cancelled',
      });

    createChargeRequest.end((_, response) => {
      if (response.statusCode === 201) {
        const coinbaseWindow = this.openBrowserPopup(
          response.body.data.hosted_url
        );

        // Wait until the window is closed to process a payment status request.
        let isPaymentVerified = false;
        let isPaymentError = false;
        let isPendingMessageShown = false;

        const windowAwaiter = setInterval(() => {
          if (isPaymentVerified) {
            clearInterval(windowAwaiter);
            coinbaseWindow.close();
            this.loaderService.hideLoader(loaderIdx);
            this.toastService.show('Payment has been processed.');
          } else {
            if (isPaymentError) {
              clearInterval(windowAwaiter);
              coinbaseWindow.close();
              this.loaderService.hideLoader(loaderIdx);
            }
          }

          // If it happens that the window closes before the payment is pending show a message
          console.log(coinbaseWindow.closed);
          if (coinbaseWindow.closed) {
            if (!isPaymentVerified && isPendingMessageShown) {
              this.toastService.show(
                'Payment window closed before payment could be finished.'
              );

              isPendingMessageShown = true;
            }

            // Clear the interval counter and remove the loader.
            clearInterval(windowAwaiter);
            this.loaderService.hideLoader(loaderIdx);
          }

          // Constantly check the payment status of the Coinbase Charge.
          const chargeCode = response.body.data.hosted_url.split('/').pop();
          superagent
            .get(
              ['https://api.commerce.coinbase.com/charges/', chargeCode].join(
                ''
              )
            )
            .set('X-CC-Api-Key', environment.COINBASE_API_KEY)
            .set('X-CC-Version', '2018-03-22')
            .end((_, response) => {
              if (response) {
                if (response.statusCode === 200) {
                  // Statuses a stored in a list, the last is the latest.
                  const lastPaymentStatus =
                    response.body.data.timeline.pop().status;
                  console.log(lastPaymentStatus)

                  // When a payment is just created, the status is NEW, so it has to be avoided.
                  if (lastPaymentStatus === 'PENDING' || lastPaymentStatus === "COMPLETED") {
                    isPaymentVerified = true;
                    const COINBASE_FEES = 0.01,
                      SERVICE_FEES = 0.05;

                    this.confirmContribution({
                      amount:
                        this.contributionAmount -
                        this.contributionAmount *
                          (COINBASE_FEES + SERVICE_FEES),
                    });
                  } else if (
                    lastPaymentStatus === 'NEW' ||
                    lastPaymentStatus === 'EXPIRED' ||
                    lastPaymentStatus === 'CANCELLED' ||
                    lastPaymentStatus === 'UNRESOLVED'
                  ) {
                    // Check the new status.
                    if (lastPaymentStatus === 'NEW') {
                      return;
                    }

                    if (!isPaymentError) {
                      this.toastService.show(
                        [
                          'Something went wrong, please check your account before retrying. Error code:',
                          chargeCode,
                          '| Reason:',
                          lastPaymentStatus,
                        ].join(' '),
                        true, true
                      );
                      isPaymentError = true;
                    }
                    
                  } else {
                    this.toastService.show(
                      'Something went wrong while accepting your crypto contribution.'
                    );
                  }
                } else {
                  // There's a malform in the status check request.
                  this.toastService.show(ERROR_MESSAGES.UNEXPECTED_ERROR, true, true);
                  console.log(
                    'Something went wrong, please check your account before retrying. Error code: ',
                    chargeCode
                  );
                }
              } else {
                this.toastService.show(ERROR_MESSAGES.NO_INTERNET, true, true);
              }
            });
        }, 1000);
      } else {
        this.loaderService.hideLoader(loaderIdx);
        console.log(response.body);
        this.toastService.show(['Something went wrong.'].join('. '));
      }
    });
  }

  openBrowserPopup(URI) {
    // Fixes dual-screen position        Most browsers      Firefox
    const dualScreenLeft =
      window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop =
      window.screenTop !== undefined ? window.screenTop : window.screenY;

    const width = window.innerWidth
      ? window.innerWidth
      : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : screen.width;
    const height = window.innerHeight
      ? window.innerHeight
      : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : screen.height;

    const systemZoom = width / window.screen.availWidth;
    const popupHeight = 550;
    const popupWidth = 450;
    const left = (width - popupWidth) / 2 / systemZoom + dualScreenLeft;
    const top = (height - popupHeight) / 2 / systemZoom + dualScreenTop;

    return window.open(
      URI,
      '_blank',
      `hidden=no,location=no,clearsessioncache=yes,clearcache=yes,height=${popupHeight},width=${popupWidth},top=${top},left=${left}`
    );
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

    // Set the new supa-charge amount.
    this.supaChargeAmount = supaChargeAmount;
    this.translatedAmount += this.supaChargeAmount;

    // Also setup the USD supa-charge amount.
    this.currencyService
      .translateTo(
        this.supaChargeAmount,
        this.currencyService.currency.code,
        'USD'
      )
      .then(
        (usdSupaChargeAmount: number) =>
          (this.usdSupaChargeAmount = usdSupaChargeAmount)
      );
  }
}
