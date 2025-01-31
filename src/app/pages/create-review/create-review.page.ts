import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ERROR_MESSAGES } from 'src/app/error_messages';
import { IEgg } from 'src/app/interfaces/IEgg';
import { EggService } from 'src/app/services/egg.service';
import { SessionService } from 'src/app/services/session.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';

@Component({
  selector: 'app-create-review',
  templateUrl: './create-review.page.html',
  styleUrls: ['./create-review.page.scss'],
})
export class CreateReviewPage implements OnInit {
  draft_key: string;
  draft: IEgg;

  islivepitch: boolean = false;
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private eggService: EggService,
    private sessionService: SessionService,
    private toastService: ToastManagerService
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe((queryParamMap) => {
      this.draft_key = queryParamMap.get('draft_key') || queryParamMap.get('pitch_key');
      this.islivepitch = queryParamMap.get('islive') === '1' ? true : false;

      // Pull the draft from the backend
      this.eggService.get(this.draft_key, { isDraft: !this.islivepitch })
        .then((data) => {
          this.draft = data;
        });
    });
  }

  sendReview() {
    superagent
      .post([environment.farmhouse, 'pitch', 'draft', this.draft.key, 'review'].join('/'))
      .set("Authorization", ["Bearer", this.sessionService.sessionToken].join(' '))
      .end((_, response) => {
        if (response) {
          if (response.statusCode == 200) {
            this.toastService.show("Review request has been received, a link to upload official documents will be shared with you via email soon.")
          } else {
            this.toastService.show(response.body.reason || ERROR_MESSAGES.UNEXPECTED_ERROR);
          }
        } else {
          this.toastService.show(ERROR_MESSAGES.NO_INTERNET)
        }
      });
  }
}
