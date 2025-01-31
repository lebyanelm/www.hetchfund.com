import { HttpClient } from '@angular/common/http';
import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IHetcher } from 'src/app/interfaces/IHetcher';
import { SessionService } from 'src/app/services/session.service';
import { TitleService } from 'src/app/services/title.service';
import { environment } from 'src/environments/environment';
import { ModalController } from '@ionic/angular';
import { EditProfileComponent } from 'src/app/components/edit-profile/edit-profile.component';
import { ConsentComponent } from 'src/app/components/consent/consent.component';
import * as superagennt from 'superagent';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { EggService } from 'src/app/services/egg.service';

@Component({
  selector: 'app-hetcher',
  templateUrl: './hetcher.page.html',
  styleUrls: ['./hetcher.page.scss'],
})
export class HetcherPage implements OnInit {
  username: string;
  hetcher: IHetcher;

  isLoading = false;
  isFound = false;
  isEditingProfile = false;
  isCuratedCampaigns = false;

  // Tab management.
  currentTab = 'issued';
  pitches_issued = [];
  pitches_bookmarked = [];
  pitches_supported = [];
  pitches_drafted = [];

  constructor(
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    public sessionService: SessionService,
    private pitchService: EggService,
    private http: HttpClient,
    private router: Router,
    private modalCtrl: ModalController,
    private toastService: ToastManagerService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params) => {
      // Read the username from the URL
      this.username = params.get('username');
      this.isLoading = true;

      this.activatedRoute.queryParamMap.subscribe((queryParamMap) => {
        this.currentTab = queryParamMap.get('tab') || 'issued';
      });
      
      // Get the data from the "backend".
      superagennt
        .get([environment.accounts, this.username].join('/'))
        .end((_, response) => {
          this.isLoading = false;
          if (response.statusCode == 200) {
            this.hetcher = response.body.data;
            this.isFound = true;
            this.titleService.onTitleChange.next(
              this.hetcher.display_name + ' | Hetchfund.com'
            );

            // Issued pitches.
            superagennt.get(
              [environment.farmhouse, , 'curator', this.sessionService.data?.email_address].join('/'))
              .end((_, response) => {
                if (response) {
                  this.pitches_issued = response.body.data;
                }
              });

            // Supported pitches.
            this.pitchService
              .get(this.hetcher.pitches_funded)
              .then((supported_pitches: any) => {
                this.pitches_supported = supported_pitches;
                this.focusTab(this.currentTab);
              });

            // Drafted pitches.
            this.pitchService.getSavedDrafts().then((drafted_pitches: any) => {
              this.pitches_drafted = drafted_pitches;
              console.log(this.pitches_drafted)
              this.focusTab(this.currentTab);
            });
          } else {
            if (response.statusCode == 404) {
              this.isFound = false;
              this.titleService.onTitleChange.next(
                this.username + ' (Not found) | Hetchfund'
              );
            } else {
              this.router.navigate(['errors', response.statusCode]);
            }
          }
        });
    });
  }

  determineLevelEnding(value) {
    const s = ['th', 'st', 'nd', 'rd'],
      v = value % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  async showEditProfileModal() {
    const modal = await this.modalCtrl.create({
      component: EditProfileComponent,
      componentProps: {
        passedData: { ...this.sessionService.data },
      },
      cssClass: 'default-modal',
    });

    modal.onDidDismiss().then((data: any) => {
      console.log(data);
      if (data.data) {
        this.sessionService.updateSessionData(data.data);
        this.hetcher = data.data;
      }
    });

    return await modal.present();
  }

  followHetcher() {
    if (this.sessionService.data?.follows.includes(this.hetcher?._id)) {
      this.sessionService.data.follows.splice(
        this.sessionService.data.follows.indexOf(this.hetcher._id),
        1
      );
    } else {
      this.sessionService.data.follows.push(this.hetcher._id);
    }
  }

  chooseNewAvatarFile() {
    if (this.hetcher?.username === this.sessionService.data?.username) {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';

      fileInput.onchange = () => {
        superagennt
          .post([environment.media_resources, 'upload'].join('/'))
          .set(
            'Authorization',
            ['Bearer', this.sessionService.sessionToken].join(' ')
          )
          .attach('file', fileInput.files[0])
          .end((_, response) => {
            if (response?.statusCode == 200) {
              this.showAvatarChangeConsent(response.body.data);
            } else {
              this.toastService.show(
                response.body?.data?.reason ||
                  'Something went wrong while uploading your media file...'
              );
            }
          });
      };

      fileInput.click();
    }
  }

  async showAvatarChangeConsent(avatarUploadResponseData) {
    if (this.hetcher?.username === this.sessionService.data?.username) {
      const modal = await this.modalCtrl.create({
        component: ConsentComponent,
        componentProps: {
          consentData: {
            title: 'Approve avatar change',
            description:
              'Are you sure you want to remove the old profile photo and replace it with a newly uploaded one?',
          },
        },
        cssClass: ['default-modal', 'consent-modal'],
      });

      modal.onDidDismiss().then((data: any) => {
        // If avatar change has been allowed
        if (data.data === true) {
          const avatarChanges = {
            profile_image: avatarUploadResponseData.url,
          };

          superagennt
            .patch(
              [environment.accounts, this.hetcher?.username, 'update'].join('/')
            )
            .set(
              'Authorization',
              ['Bearer', this.sessionService.sessionToken].join(' ')
            )
            .send(avatarChanges)
            .end((_, response) => {
              console.log(response);
              if (response?.statusCode === 200) {
                this.sessionService.updateSessionData(response.body.data);
                this.hetcher = response.body.data;
              } else {
                this.toastService.show(
                  response.body?.data?.reason ||
                    'Something went wrong while updating your profile details...'
                );
              }
            });
        }
      });

      return await modal.present();
    }
  }

  // Focuses a tab to which certain pitches are shown.
  focusTab(tabName: string): void {
    const currentTab = document.getElementById(this.currentTab),
      nextTab = document.getElementById(tabName);

    if (currentTab) {
      currentTab.style.display = 'none';
    }
    if (nextTab) {
      nextTab.style.display = 'grid';
    }

    this.currentTab = tabName;
    document.getElementById(this.currentTab)
          ?.removeAttribute('hidden');
  }
}
