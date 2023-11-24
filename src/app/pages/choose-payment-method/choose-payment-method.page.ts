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
    private toastService: ToastManagerService,
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
      console.log(
        currentCurrencyCode,
        newCurrency.code,
        this.customContributionAmount
      );
      if (newCurrency.code !== currentCurrencyCode) {
        this.currencyService
          .translateTo(
            this.customContributionAmount,
            currentCurrencyCode,
            newCurrency.code
          )
          .then((newCustomContributionAmount) => {
            console.log('New amount', newCustomContributionAmount);
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
                console.log(this.translatedAmount, this.contributionAmount);

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

                  console.log('Reward selected:', this.reward);
                }

                // Convert it to USD for paypal / coinbase payments
                this.currencyService
                  .translateTo(this.translatedAmount, 'ZAR', 'USD')
                  .then((usdContributionAmount: number) => {
                    this.usdContributionAmount = usdContributionAmount;

                    console.log(
                      'Initializing Paypal Payment Button.',
                      this.usdContributionAmount
                    );
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
          'An error prevented the buyer from checking-out with PayPal.'
        );
        console.log(err);
      },
    });

    paypalButtonsComponent.render('#paypal-button-container').catch((err) => {
      this.toastService.show('PayPal Buttons failed to render');
      console.log(err);
    });
  }

  // Round off digits to the nearest 2 decimal places
  round(number: number) {
    return Math.round(number * 100) / 100;
  }

  // Complete the contribution by sending it to the Farmhouse for comfirmation
  confirmContribution(data) {
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
          'Somehow the payment failed, please check if you were charged before trying again. Report this if it occurs again.'
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
      if (response) {
        if (response.statusCode === 200) {
          const a = document.createElement('a');
          a.href = `/pitches/${contribution.pitch_key}/contribution/completed?contribution_id=${contribution.key}`;
          a.click();
        } else {
          this.toastService.show(
            response.body.reason || ERROR_MESSAGES.UNEXPECTED_ERROR
          );
        }
      } else {
        this.toastService.show(ERROR_MESSAGES.NO_INTERNET);
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
        description: 'Contribution made through Yoco from Hetchfund.com',
        metadata: {
          pitch: this.pitchKey,
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
                      response.body?.reason || ERROR_MESSAGES.UNEXPECTED_ERROR
                    );
                  }
                } else {
                  this.toastService.show(ERROR_MESSAGES.NO_INTERNET);
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
        description: 'Powered by Hetchfund.com',
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
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALAAAABiCAMAAADHn6lIAAAAKlBMVEUAAABHcEwAAAAAAAAsvqLO9lqMzIb0pxIA09YDDYkDEokA1tz+dTL92wAOH4ECAAAACnRSTlOwAEB5/f5Nq6p+rDUahgAAB75JREFUeNrt24mCozYMxnEkbYXZ4/1ftyWOJv+VhcfJzvRWLwLB+0N8QxiHbvJz+a1EWKqq8lKpfHht+4+iIFbbeqmwcFTXB6ub5FJTNT0r77v/UdydpWZmqgHeB7S8lW1vZRLlv501jH1buwt3JmsYjxv371H7fr2PiPQewLoL6z6uqlHspE0OA7vgD7ezOhng0A5kPd8Zu+g7YAyqTEUJ3gmOXUawImqawSJymjE0/tzbHpfgeEf+42GrEsGVJBUpsQIcyzt7pnhx2WEQeTavmlnmJGJ3AdYrsHiIo2eoSzBaAECJc89dDxBMZYdlBMcrZygz2Euw8r08gHT6vcurROAYE1h7NhN4f7zcnwfDN0SE7bwvFImwOO0EP64RKpdgiWYjVXMwE8A1OoTYO9iLa4SWZ4naAcwWB1iXwSYs9hwh7s4ywgwqwRx3AUxxBWaHBrClEHeolx9zhlGQYYovwdKX44wk8D4FpxAT7NHq8mNOESyANfVsChZE6HUwQrx3eZkIDAMwh5mBv8c4UfoyGCH281/9n/GipmdFjABGtPJ1mCskizedguUCjEz08o7PFzWUEszLzQqYQ+nzYCMY+R0vaigjWCleAXOwJ8E8lTuUfSFHGKUEx+Y5mHnG5XsGtsl1WMSjwYHPEWYZwTz2Obggz8A6gLcCjOUcYZQSHACdgD3uftI5U4J78R15F64hsoqwaS9En+AUY4IZYZTOwQxxjjBCjOUEHs8MwTz8ErzLUHPw2OLcE6TAgWf+0W+CefwjmA1eB7PF9c2/s6lDhDN4U4LZgAzmj9wYCZmClWKlN5Bstw87kmYEUzyCGQhTYcNsDhZj+HKkaXTguR9bDDBWF2DfvzuPHA3WAuxJvPU7guLTlMY9JSIgucVWpYxg3/f8W751QBfMwcOtB8tpdODxQ0aZEowDmc/8aPr42SZTY5jxMFMZyuWiVLVYdQfnwTvY91t5PbEGwCb/rPofPKn/wRezyXrWh865u/uwprV2W3kuxPIU3L708uISkacSzCopLl+5eMDtW68GLlbdFyfg4Ea1fPmMuvzc5UCGY8MOmmxEYaWvgLuXNV7u1ShWmIB6HOF4l8X2tn7iqQpwWwF3L6vRy0/IGdgA1uEuC61ssAMc4hWwA8sca55/V6zPtV2DH29v4U0vEJMV8Jdc+eaPTNqLG3ZD3LkjiVHhIrg9BXanV8nqFk3xwDAE5/ubAMMbfoJZM7CzsUhw0SnDnX/eRrClTdaBcITzFXDjz5r49cVru87pBnA6nNNrucFo8etgH+5gi2mUek5aM9i4STrYB4a/Bv5yBbZqZq1vYYt7FwE+/+GmO7hFAIZM+IeAtwq83cGWLyAKcPr+VKZg/0CwSqoHuNs5m0MwWnyjB7hJqvZLYFkBawf3RXaRYI2tfdMU3ALcPhdsabpMN8NFN7b2Bi+C20dHguDIc3QxgXuL+6YZ+BvB/pk/dIGPBidwtDh+M1/qsLQnwWk4m4F7WBHTBNZotDzAPr9KNPFFcGOIW/MH7/o63Eka0Ung3mI9GwywzK/DTaStgR2Z6MvNS7ABHJ/G8TaCY6FvAnj6Sdc6/Km7tYe9/KmLnlpIt3hXAebn96ZShrglsLQlcGSCVYVYHxYNP77vVIBxSwcwQowIEyxrYB+8DSGuJyAjISc6g/l2gtliNJjgtgSWAey8TrDBBCtimsE8XoK/JbAnsKyBB/HF/LsSzEcZKrBsRjBbjAZncFsD++ilGHe8xCl0NoJVBzDv4bsxg2UFnMU+Tn9beAnmHZASHAUwmc29NXoJbmtgin06/56+zJR1MEEQJrBw4xW4kxu4IPfuqnCVUskA1E/uqqC8jdN9Z9N/3v5J0636//zw3x/8P3h5+l31OOtcvC18/fppYHdxlMyff+fXv2YWL46vvQ4RvS/2Lae/H4tKKjPt9ST4O4vPjgWXYj6ootgSyq+PRcGh9II5fcdpafXba76Yg/H8O8UES2wg6wA4DgVkgvk4PKKJl+jJBDx//j2DLbN07DCLYEPy+nJGWsevgC2PIVFlh9HHosMsgjl+mQksTsD18++6Cj6qDmNzARawmIlo9gKYXvrnYBY7XIrZYbDIZCJm4Pnz75MMo9DhXFWGTSowEzEHW/mlwAR8TDqc6+BVIl82o7EWcinBu0ftPmQqcBmsz3T40BHcy4xctjjgBdiHPXQEaw0mawIWSVs6WFjp1HX3i+DI2csdFpEMNhvFuPz2f6+C5QqsL3cYNxwxUAxQZgKJSGBWBnOMjwJj8uWEXWWCibgE778CPp7ssGJYFh9w/tRIHMeTYIybAb30k8Gy8kPHDF+Kt14yB/P9+hxYezaPGfgowXWMjYl4Fazvd1gm4PAmMGOcM6HLYKuff2dcyg5DlcHYko5cq1YiERPw0vPvAI8dliswSwjOMcbYug6un3/nJg6KDou+Dz4IzjFmhmUdPGQCu7/RLYMPAtdvL6sY4+SVYGHVz79zdGXM2OFYmoEPgjn+mIh1MFPMDvAEssHosDz/KxLFTMQyuH7+ff7/64dlmEjR2kswusBErIKxk9XPvxu8CYyeatVhlQyupxL4ahWMTpqWW1RKsI4drmd+LI+J5QmYj55nMp9/nz/mzsmz41Z8pYfGa4D1MoNmHJ/1OxlMrvQ7eQvlAAAAAElFTkSuQmCC',
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

                  // When a payment is just created, the status is NEW, so it has to be avoided.
                  if (lastPaymentStatus === 'COMPLETED') {
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

                    isPaymentError = true;
                    this.toastService.show(
                      [
                        'Something went wrong, please check your account before retrying. Error code:',
                        chargeCode,
                        '| Reason:',
                        lastPaymentStatus,
                      ].join(' '),
                      true
                    );
                  } else {
                    this.toastService.show(
                      'Something went wrong while accepting your crypto contribution.'
                    );
                  }
                } else {
                  // There's a malform in the status check request.
                  console.log(
                    'Something went wrong, please check your account before retrying. Error code: ',
                    chargeCode
                  );
                }
              } else {
                console.log(ERROR_MESSAGES.NO_INTERNET);
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
