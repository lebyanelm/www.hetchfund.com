import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ICurrencies } from 'src/app/interfaces/ICurrencies';
import { CurrencyResolverService } from 'src/app/services/currency-resolver.service';

@Component({
  selector: 'app-currencies-selector',
  templateUrl: './currencies-selector.component.html',
  styleUrls: ['./currencies-selector.component.scss'],
})
export class CurrenciesSelectorComponent implements OnInit {
  // ------ FOR THE CURRENCY MENU --------
  currencyCodes: string[] = [];
  currencies: ICurrencies = {};

  selectedCurrency: { name: string; code: string; symbol: string } = null;

  constructor(
    public currencyResolverService: CurrencyResolverService,
    private modalController: ModalController
  ) {
    // ------ LOAD CURRENCIES FROM TRANSLATOR ----------
    this.currencyResolverService.getAll().then((currencies: ICurrencies) => {
      this.currencies = currencies;
      this.currencyCodes = Object.keys(this.currencies);
    });
  }

  closeCurrencySelectorModal() {
    this.modalController.dismiss(this.selectedCurrency);
  }

  selectCurrency(currencyCode: string) {
    this.selectedCurrency = {
      name: this.currencies[currencyCode].name,
      symbol: this.currencies[currencyCode].symbol,
      code: currencyCode,
    };

    // After selecting the currency code.
    this.closeCurrencySelectorModal();
  }

  ngOnInit(): void {}
}
