import { Component, Input, OnInit } from '@angular/core';
import { SessionService } from 'src/app/services/session.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';

@Component({
  selector: 'app-create-bottom-footer',
  templateUrl: './create-bottom-footer.component.html',
  styleUrls: ['./create-bottom-footer.component.scss'],
})
export class CreateBottomFooterComponent implements OnInit {
  @Input() key: string;
  @Input() progress;
  @Input() save;
  @Input() binder;
  @Input() isLastStage = null;
  @Input() isNewPitch = null;
  @Input() create;

  constructor(
    private toastService: ToastManagerService,
    private sessionService: SessionService
  ) {}
  ngOnInit() {}

  saveMethod() {
    this.save
      .bind(this.binder)()
      .then(() => this.toastService.show('Changes have been saved.'));
  }

  createMethod() {
    this.create
      .bind(this.binder)()
      .then((data) => {
        this.toastService.show('Your pitch has been created.');
        console.log(data);
      });
  }

  sendForReview() {
    return new Promise((resolve, reject) => {
      // Send the review request to the farmhouse.
      superagent
        .post([environment.farmhouse, 'pitch', 'draft', 'review'].join('/'))
        .send({ draft_key: this.key })
        .set(
          'Authorization',
          ['Bearer', this.sessionService.sessionToken].join(' ')
        )
        .end((_, response) => {
          if (response) {
            if (response.statusCode === 200) {
              this.toastService.show('Pitch has been accepted for review!');
            } else {
              this.toastService.show(
                response.body.reason ||
                  'Something went wrong while sending pitch for review.'
              );
            }
          } else {
            this.toastService.show(
              'No internet connection to complete the request.'
            );
          }
        });
    });
  }

  nextStage() {
    this.save
      .bind(this.binder, true)()
      .then(() => this.toastService.show('Changes automatically saved.'));
  }
}
