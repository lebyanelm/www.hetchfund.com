import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IConsent } from 'src/app/interfaces/IConsent';

@Component({
  selector: 'app-consent',
  templateUrl: './consent.component.html',
  styleUrls: ['./consent.component.scss'],
})
export class ConsentComponent implements OnInit {
  @Input() consentData: IConsent;
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}
  accept() {
    this.modalCtrl.dismiss(true);
  }
  cancel() {
    this.modalCtrl.dismiss(false);
  }

  dismiss(_return: any) {
    this.modalCtrl.dismiss(_return);
  }
}
