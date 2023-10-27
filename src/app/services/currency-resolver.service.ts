import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as currencyFormater from 'currency-formatter';
import { environment } from 'src/environments/environment';
import { LoaderService } from './loader.service';
import { Subject } from 'rxjs';
import * as superagent from 'superagent';
import { ERROR_MESSAGES } from '../error_messages';
import { ICurrency } from '../interfaces/ICurrency';
import { CurrenciesSelectorComponent } from '../components/currencies-selector/currencies-selector.component';
import { ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class CurrencyResolverService {
  currency_state: Subject<ICurrency> = new Subject<ICurrency>();
  SERVICE_API_ENDPOINT = environment.translator;

  currency: ICurrency;
  value: number;
  currencies = [];

  // Load default currency; else use ZAR.
  default_currency = localStorage.getItem('_currency')
    ? JSON.parse(localStorage.getItem('_currency'))
    : {
        code: 'ZAR',
        name: 'South African Rand',
        name_plural: 'Rands',
        symbol: 'R',
        exchange_rate: 1,
        timestamp: null,
        note: 'This value is updated every 30 seconds.',
      };

  constructor(
    private loaderService: LoaderService,
    private modalCtrl: ModalController
  ) {
    this.currency = this.default_currency;
    this.setCurrency(this.default_currency);
  }

  getAll() {
    return new Promise((resolve, reject) => {
      if (Object.keys(this.currencies).length === 0) {
        superagent
          .get([environment.translator, 'all'].join('/'))
          .end((_, response) => {
            if (response && response.statusCode === 200) {
              resolve(response.body.data);
            } else {
              if (response) {
                reject(response.body);
              } else {
                reject({
                  reason: 'No internet connection.',
                  message:
                    "Seems you're not connected to the internet. Please check your connection.",
                });
              }
            }
          });
      } else {
        resolve(this.currencies);
      }
    });
  }

  setCurrency(currency: ICurrency, isForced = false) {
    if (this.currency.timestamp && isForced == false) {
      const previousTimestamp = parseInt(this.currency.timestamp),
        lastUpdateTimeDifference = Date.now() - previousTimestamp,
        timeDifferenceInHours = lastUpdateTimeDifference / 1000;

      // Refresh for exchange rate updates if an hour has passed.
      if (timeDifferenceInHours >= 30) {
        this.loadCurrencyExchangeRates(currency);
      }
    } else {
      this.loadCurrencyExchangeRates(currency);
    }
  }

  loadCurrencyExchangeRates(currency: ICurrency) {
    const loaderIdx = this.loaderService.showLoader();

    superagent
      .get(
        [this.SERVICE_API_ENDPOINT, 'translate', 1, 'ZAR', currency.code].join(
          '/'
        )
      )
      .end((_, response) => {
        this.loaderService.hideLoader(loaderIdx);
        if (response.statusCode == 200) {
          this.currency = {
            // Keep old fields to replace new ones.
            ...this.currency,

            // Replace with new.
            ...currency,
            exchange_rate: response.body.data.exchange_rate,
            timestamp: Date.now().toString(),
          };
          console.log(this.currency);

          // Alert for currency change.
          this.currency_state.next(this.currency);

          // Save the set currency for subsequent refreshes
          this.saveCurrentCurrency();
        }
      });
  }

  saveCurrentCurrency() {
    localStorage.setItem('_currency', JSON.stringify(this.currency));
  }

  // CONVERTS TO THE CURRENT CURRENCY PRICE CONVERSIONS + FORMAT.
  translate(
    amount: string | any,
    multiplier: boolean = true,
    isDigit: boolean = false,
    addAmount: number = 0
  ): string {
    if (!isDigit) {
      amount = parseFloat(amount);
    }

    // ALL VALUES ARE ROUNDED OFF TO 2 DECIMAL PLACES.
    amount =
      parseFloat(amount) *
      (multiplier === true ? this.currency.exchange_rate : 1);

    return this.format((amount + addAmount).toFixed(2));
  }

  // FORMATS THE AMOUNT TO THE CURRENCY FORMATS.
  format(amount: any, addAmount: any = 0) {
    if (typeof amount === 'string') {
      amount = parseFloat(amount);
    }

    if (typeof addAmount === 'string') {
      addAmount = parseFloat(addAmount);
    }

    amount = amount + addAmount;

    // Custom currency. These are currencies not formatted by 'currency-formatter' module.
    if (['ADA', 'LTC', 'ETH'].includes(this.currency.code)) {
      switch (this.currency.code) {
        case 'ADA':
          return [amount, this.currency.symbol].join(' ');
        case 'LTC':
          return [this.currency.symbol, amount].join('');
        case 'ETH':
          return [amount, this.currency.symbol].join(' ');
      }
    } else {
      return currencyFormater.format(amount, {
        code: this.currency.code,
      });
    }
  }

  translateTo(amount: number, from: string, to: string) {
    const loaderIdx = this.loaderService.showLoader();
    return new Promise((resolve, reject) => {
      console.log('from=', from, '; to=', to);
      superagent
        .get(
          [this.SERVICE_API_ENDPOINT, 'translate', amount, from, to].join('/')
        )
        .end((_, response) => {
          if (response) {
            this.loaderService.hideLoader(loaderIdx);
            if (response.statusCode === 200) {
              resolve(amount * response.body.data.exchange_rate);
            } else {
              reject(response.body.reason || ERROR_MESSAGES.UNEXPECTED_ERROR);
            }
          } else {
            reject(ERROR_MESSAGES.NO_INTERNET);
          }
        });
    });
  }

  async openCurrencySelectorModal() {
    const modal = await this.modalCtrl.create({
      component: CurrenciesSelectorComponent,
      backdropDismiss: true,
      cssClass: 'default-modal currency-modal',
    });

    // WHEN MODAL IS CLOSED AND CURRENCY HAS BEEN SELECTED.
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.setCurrency(data.data, true);
      }
    });

    return await modal.present();
  }
}
