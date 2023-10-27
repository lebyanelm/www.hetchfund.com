import { Component, OnInit } from '@angular/core';
import { IonModal, ModalController } from '@ionic/angular';
import { ICurrency } from 'src/app/interfaces/ICurrency';
import { CurrencyResolverService } from 'src/app/services/currency-resolver.service';
import { CurrenciesSelectorComponent } from '../currencies-selector/currencies-selector.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  constructor(
    public currencyResolverService: CurrencyResolverService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {}

  openCurrencySelectorModal() {
    this.currencyResolverService.openCurrencySelectorModal();
  }
}
