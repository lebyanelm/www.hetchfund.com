import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ICategories } from 'src/app/interfaces/ICategories';
import { LoaderService } from 'src/app/services/loader.service';
import { SessionService } from 'src/app/services/session.service';
import { TitleService } from 'src/app/services/title.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';

@Component({
  selector: 'app-choose-interests',
  templateUrl: './choose-interests.page.html',
  styleUrls: ['./choose-interests.page.scss'],
})
export class ChooseInterestsPage implements OnInit {
  interests: ICategories;
  interestKeys: string[];
  selectedInterests: string[] = [];

  isLoading = false;
  isUnableToLoad = false;
  isAccountSetup = false;
  isFromAccountSettings = false;

  constructor(
    private titleService: TitleService,
    private loaderService: LoaderService,
    private sessionService: SessionService,
    private toastService: ToastManagerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.titleService.onTitleChange.next('Choose your interests | Hetchfund');
    this.getCategories();
  }
  getCategories() {
    this.isLoading = true;
    superagent
      .get([environment.farmhouse, 'categories'].join('/'))
      .end((_, response) => {
        this.isLoading = false;
        if (response.statusCode == 200) {
          this.interests = response.body.data;
          this.interestKeys = Object.keys(this.interests);
          this.isUnableToLoad = false;
        } else {
          this.isUnableToLoad = true;
        }
      });
  }

  toggleSelection(interest) {
    if (this.selectedInterests.includes(interest)) {
      this.selectedInterests.splice(
        this.selectedInterests.indexOf(interest),
        1
      );
    } else {
      this.selectedInterests.push(interest);
    }
    console.log(this.selectedInterests);
  }

  saveInterestSelection() {
    if (this.sessionService.sessionToken) {
      const loaderIdx = this.loaderService.showLoader();
      superagent
        .patch(
          [
            environment.accounts,
            this.sessionService.data.username,
            'update',
          ].join('/')
        )
        .set(
          'Authorization',
          ['Bearer', this.sessionService.sessionToken].join(' ')
        )
        .send({ interests: this.selectedInterests })
        .end((_, response) => {
          this.loaderService.hideLoader(loaderIdx);
          if (response.statusCode === 200) {
            // The interests have been updated.
            this.toastService.show('Your interests have been updated.');
            if (this.isAccountSetup) {
              this.router.navigateByUrl(
                '/profile/' +
                  this.sessionService.data?.username +
                  '?isFinishAccount=true'
              );
            } else if (this.isFromAccountSettings) {
              this.router.navigateByUrl('/preferences/interests');
            } else {
              this.router.navigateByUrl('/');
            }
          } else {
            this.toastService.show(
              response.body?.data?.reason || 'Something went wrong.'
            );
          }
        });
    } else {
      this.toastService.show('Please signin to update interests.');
    }
  }
}
