import { Component, ComponentRef, Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { nanoid } from 'nanoid';
import { SessionService } from './session.service';

declare const SmileIdentity;
@Injectable({
  providedIn: 'root',
})
export class ToastManagerService {
  currentMessages: any[] = [];
  persistantMessage: any;
  messageTimeout = 4000; // in ms

  constructor(private modalCtrl: ModalController) {}

  show(message, isPersist: boolean = false, isError: boolean = false) {
    const pushIndex = this.currentMessages.push({
      id: nanoid(),
      isPersist,
      message,
      isError
    });

    if (!isPersist) {
      setTimeout(() => {
        this.currentMessages.splice(pushIndex - 1, 1);
      }, this.messageTimeout);
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
      console.log(data)
      if (data.data) {
        return data.data;
      } else {
        return data;
      }
    });

    modal.present();
  }

  openBrowserPopup(URI, options: { height?: number; width?: number; } = { height: 850, width:  450 }) {
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
    const popupHeight = options.height;
    const popupWidth = options.width;
    const left = (width - popupWidth) / 2 / systemZoom + dualScreenLeft;
    const top = (height - popupHeight) / 2 / systemZoom + dualScreenTop;

    return window.open(
      URI,
      '_blank',
      `hidden=no,location=no,clearsessioncache=yes,clearcache=yes,height=${popupHeight},width=${popupWidth},top=${top},left=${left}`
    );
  }
}
