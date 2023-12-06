import { Component, Input, OnInit } from '@angular/core';
import { EggService } from '../../services/egg.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';

@Component({
  selector: 'app-social-buttons',
  templateUrl: './social-buttons.component.html',
  styleUrls: ['./social-buttons.component.scss'],
})
export class SocialButtonsComponent implements OnInit {
  @Input() pitch_name: string;
  @Input() pitch_key: string;
  @Input() is_mobile: boolean;
  @Input() isUser: boolean = false;
  @Input() isShowText: boolean = true;
  href: string;

  constructor(
    public pitchService: EggService,
    private toastService: ToastManagerService
  ) {}

  ngOnInit() {
    if (this.is_mobile) {
      this.isShowText = false;
    }
  }

  getPitchLink(): string {
    return window.location.href;
  }

  copyPitchLink() {
    window.navigator.clipboard
      .writeText(this.getPitchLink())
      .then(() => this.toastService.show('Link copied!'));
  }

  copyEmbedCode() {
    const embedCode = `<iframe src="https://www.hetchfund.com/embed/${
      this.pitch_key
    }" height="100%" width="515" title="Embedded Hetchund Pitch: ${
      this?.pitch_name || 'Unnamed'
    }"></iframe>`;

    window.navigator.clipboard
      .writeText(embedCode)
      .then(() => this.toastService.show('Embed code copied!'));
  }
}
