import { Component, ComponentRef, Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastManagerService {
  currentMessages: any[] = [];
  persistantMessage: any;
  messageTimeout = 4000; // in ms

  constructor(private modalCtrl: ModalController) {}

  show(message, isPersist: boolean = false) {
    if (isPersist === false) {
      const pushIndex = this.currentMessages.push({
        isPersist,
        message,
      });

      setTimeout(() => {
        this.currentMessages.splice(pushIndex - 1, 1);
      }, this.messageTimeout);
    } else {
      if (this.persistantMessage) {
        this.show(this.persistantMessage.message);
      }

      this.persistantMessage = {
        isPersist,
        message,
      };
    }
  }

  async openModalComponentElement(
    componentElement: any,
    additionalOptions: any = {}
  ) {
    const modal = await this.modalCtrl.create({
      component: componentElement,
      backdropDismiss: true,
      cssClass: 'default-modal',
      ...additionalOptions,
    });

    // WHEN MODAL IS CLOSED AND CURRENCY HAS BEEN SELECTED.
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        return data.data;
      }
    });

    modal.present();
  }
}
