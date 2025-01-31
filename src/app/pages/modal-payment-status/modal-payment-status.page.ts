import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TitleService } from 'src/app/services/title.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';

@Component({
  selector: 'app-modal-payment-status',
  templateUrl: './modal-payment-status.page.html',
  styleUrls: ['./modal-payment-status.page.scss'],
})
export class ModalPaymentStatusPage implements OnInit {
  paymentStatus: string;
  paymentStatuses = {
    success: {
      icon: "checkmark-sharp",
      text: "Contribution completed",
      description: "Your payment has been successfully sent, our third-party processor is processing it away to our system and it will reflect to the respective contributed project. You'll be notified on payment confirmation.",
      sub: "Thank you for your gratitude and believe in our mission!"
    },
    error: {
      icon: "close-sharp",
      text: "Contribution error",
      description: "For some reason your payment could not be sent, please confirm your balance before retrying the contribution incase the funds have already left your payment account. In case this is a mistake please contact our support faculty for assistance.",
      sub: "Our support faculty is always available to assist you when in need."
    },
    cancel: {
      icon: "alert-sharp",
      text: "Contribution cancelled",
      description: "Your contribution has been successfully cancelled, non of your selected methods were charged.",
      sub: "Sad to let the opportunity go, but we understand, feel free to come back and contribute."
    }
  }
  
  contributionId: string;
  pitchKey: string;
  
  constructor(private activatedRoute: ActivatedRoute, private titleService: TitleService, private toastService: ToastManagerService) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      this.paymentStatus = paramMap.get("payment_status");
      this.pitchKey = paramMap.get("pitch_key");
      this.titleService.onTitleChange.next(this.paymentStatuses[this.paymentStatus].text + " | Hetchfund.com");
    });

    this.activatedRoute.queryParamMap.subscribe((queryParams) => {
      this.contributionId = queryParams.get("cid");
    });
  }

  closeWindow() {
    window.close();
  }

  copyErrorMessage() {
    window.navigator.clipboard.writeText(this.paymentStatuses[this.paymentStatus]?.description)
      .then(() => this.toastService.show("Error message copied to clipboard."))
      .catch(() => this.toastService.show("Permission denied to copy to clipboard."));
  }
}


