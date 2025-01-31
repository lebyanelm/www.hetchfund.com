import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ERROR_MESSAGES } from 'src/app/error_messages';
import { SessionService } from 'src/app/services/session.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import QRCode from 'qrcode';

@Component({
  selector: 'app-identity-verification-modal',
  templateUrl: './identity-verification-modal.component.html',
  styleUrls: ['./identity-verification-modal.component.scss'],
})
export class IdentityVerificationModalComponent  implements OnInit {
  kycQrcode: string;

  constructor(private toastService: ToastManagerService,
              private sessionService: SessionService,
              private modalCtrl: ModalController) { }

  ngOnInit() {
    QRCode.toDataURL(this.sessionService.getKYCUrl())
      .then(url => {
        this.kycQrcode = url;
      })
  }

  startVerification() {
    this.sessionService.startRealPersonVerification();
  }

  closeModal() {
    this.modalCtrl.dismiss(null);
  }

  supresssKycFlow() {
    this.sessionService.suppressRealPersonVerification();
    this.closeModal();
  }
}
