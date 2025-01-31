import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DomSanitizer, Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { OverlayEventDetail } from '@ionic/core/components';
import { IonModal } from '@ionic/angular';
import * as e from 'express';
import { CustomRichTextEditorComponent } from 'src/app/components/rich-text-editor/rich-text-editor.component';
import { IComment } from 'src/app/interfaces/IComment';
import { IEgg } from 'src/app/interfaces/IEgg';
import { IMediaFile } from 'src/app/interfaces/IMediaFile';
import { CurrencyResolverService } from 'src/app/services/currency-resolver.service';
import { EggService } from 'src/app/services/egg.service';
import { RouterService } from 'src/app/services/router.service';
import { SessionService } from 'src/app/services/session.service';
import { TitleService } from 'src/app/services/title.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-egg-campaign',
  templateUrl: './egg-campaign.page.html',
  styleUrls: ['./egg-campaign.page.scss'],
})
export class EggCampaignPage implements OnInit, AfterViewInit {
  @ViewChild('StoryBody') storyBody: CustomRichTextEditorComponent;
  @ViewChild(IonModal) modal: IonModal;
  modalMessage: string;
  modalRemarks: string;
  modalAction: string;

  eggKey: string;
  data: IEgg;
  sessionToken: string;
  href = window.location.href;

  isbookmarked = false;
  iscurator = false;
  isLoadingBookmark = true;

  // Related companies in the same field as this one
  related: IEgg[] = [];
  isLoadingRelated = true;

  // Tab management
  activeTab = 'story';

  // Comments management
  comments: IComment[] = [];

  // Media files attached in the pitch.
  mediaFiles: IMediaFile[] = [];
  currentMediaFile: number = 0;

  hetchers = {
    isLoading: true,
    data: [],
  };
  curators = {
    isLoading: true,
    data: [],
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    public currencyResolver: CurrencyResolverService,
    private titleService: TitleService,
    public eggService: EggService,
    public sessionService: SessionService,
    public domSanitizer: DomSanitizer,
    private routerService: RouterService,
    private toastService: ToastManagerService,
    private loaderService: LoaderService,
    private meta: Meta
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params) => {
      // Get the data of the pitch from the backend
      this.eggKey = params.get('pitch_key');

      this.eggService.get(this.eggKey, {isDraft: false, enableInterest: true, enableRecent: true}).then((data: IEgg) => {
        this.data = data;
        
        // Checks if the user opening this pitch is the curator or not.
        this.iscurator = [this.data.curator, ...this.data.other_curators].includes(this.sessionService.data?.email_address);

        // Load query params data for processing.
        this.activatedRoute.queryParamMap.subscribe((queryParams) => {
          this.activeTab = queryParams.get("tab") || "story";
          // Re-activate Editor.js element.
          if (this.activeTab == 'about') {
            setTimeout(() => {
              if (this.storyBody) {
                this.storyBody.setData(this.data?.story, false);
              }
            }, 50); // Wait 50ms for the UI to re-render.
          }
        });
        
        this.storyBody.setData(this.data?.story, false);

        // TODO: Find ways to do SEO
        this.isbookmarked = this.data?.bookmarks.includes(
          this.sessionService.data?.email_address
        );
        this.isLoadingBookmark = false;

        // Change the title of the page.
        this.titleService.onTitleChange.next(
          [this.data?.name || this.data?.funding_purpose, 'Hetchfund'].join(
            ' | '
          )
        );

        // Remove the first "To" if it exists
        const toRegex = /\b[To|to]\w*\b\s?/gm,
          toResults = toRegex.exec(this.data?.funding_purpose);
        if (toResults !== null && toResults.index === 0) {
          const splitFundingPurpose = this.data?.funding_purpose.split('');
          splitFundingPurpose.splice(toResults.index, 3);
          this.data.funding_purpose = splitFundingPurpose.join('');
        }

        // Merge the media-files in to one.
        if (this.data?.presentation_video) {
          this.mediaFiles.push({
            source: 'Presentation video file',
            fileType: 'video',
            index: this.mediaFiles.length,
            cdnUrl: this.data?.presentation_video,
          });
        }

        this.mediaFiles = [
          {
            source: 'Placeholder image file',
            fileType: 'image',
            index: this.mediaFiles.length,
            cdnUrl: this.data?.thumbnail_url,
          },
        ];

        this.data?.story?.blocks.forEach((block) => {
          if (block?.type === 'image' || block?.type === 'video') {
            this.mediaFiles.push({
              source:
                block?.type === 'image'
                  ? 'Story image media file'
                  : 'Story video media file',
              fileType: block?.type,
              index: this.mediaFiles.length,
              cdnUrl: block?.data?.cdnUrl,
            });
          }
        });

        // Find companies related to this one
        this.getRelated();
      });

      // Fetch the list of hetchers the pitch has
      superagent
        .get([environment.farmhouse, this.eggKey, 'hetchers'].join('/'))
        .end((_, response) => {
          this.hetchers.isLoading = false;
          if (response) {
            this.hetchers.data = response.body.data;
          }
        });

      // Fetch the list of curators the pitch has
      superagent
        .get([environment.farmhouse, this.eggKey, 'curators'].join('/'))
        .end((_, response) => {
          this.curators.isLoading = false;
          if (response) {
            this.curators.data = response.body.data;
          }
        });
    });
  }

  bookmark() {
    this.isLoadingBookmark = true;
    this.eggService.bookmark(this.data.key).then((responseData: IEgg) => {
      this.data = responseData;
      this.isbookmarked = this.data.bookmarks.includes(
        this.sessionService.data?.email_address
      );
      this.isLoadingBookmark = false;
    });
  }

  getRelated() {
    this.isLoadingRelated = true;
    this.eggService.getRelated(this.data?.name).then((related: IEgg[]) => {
      this.isLoadingRelated = false;
      this.related = related;
    });
  }

  setActiveTab(tabName: string) {
    this.routerService.route(["pitches", this.eggKey, '?tab=' + tabName])
  }

  selectMediaFile(mediaFile: IMediaFile) {
    this.currentMediaFile = this.mediaFiles.findIndex((_mf) => _mf.cdnUrl === mediaFile.cdnUrl);
  }

  previousMedia() {
    if (this.currentMediaFile - 1 === -1) {
      return this.currentMediaFile = this.mediaFiles.length - 1;
    }

    this.currentMediaFile -= 1;
  }

  nextMedia() {
    if (this.currentMediaFile + 1 > this.mediaFiles.length - 1) {
      return this.currentMediaFile = 0;
    }

    this.currentMediaFile += 1;
  }

  showMediaFile(index: number): void {
    if (index > -1 && index < this.mediaFiles.length) {
      this.currentMediaFile = index;
    }
  }

  commitPledge() {
    this.routerService.route(['pitches', this.eggKey, 'contribution']);
  }

  openPitchEditor() {
    this.routerService.route(['pitches', 'create', 'basics?islive=1&pitch_key=' + this.data?.key]);
  }

  URLEncode(item: string) {
    return encodeURIComponent(item);
  }

  ngAfterViewInit(): void {
    const content = document.querySelector('ion-content'),
          bottomElement = document.querySelector(".mobile-social-buttons") || document.querySelector(".story-tab"),
          headerContainer = document.querySelector(".header-container"),
          stickyButtonsContainer = document.querySelector(".sticky-funding-button");

    let stickyPointEnabled = false;

    // Scroll events are disabled by default for content for
    // performance reasons, enable them to listen to them
    content.scrollEvents = true;
    content.addEventListener('ionScroll', (event: any) => {
      const bottomPoint = bottomElement.getClientRects()[0].bottom,
            headerContainerHeight = headerContainer.getClientRects()[0].height,
            scrollPosition = event.detail.scrollTop;
      
    if (scrollPosition >= (bottomPoint - headerContainerHeight)) {
      if (!stickyPointEnabled) {
        stickyPointEnabled = true;
        stickyButtonsContainer.classList.add("sticky");
      }
    } else {
      stickyPointEnabled = false;
      stickyButtonsContainer.classList.remove("sticky");
    }
    });
  }

  requestEndingPitch() {
    this.modalMessage = "Ending your Pitch will hide it from the public, this means it'll no longer be able to recieve funding.";
    this.modalRemarks = "Remember: You can still resume it when needed, or permenantly delete it after ending it.";
    this.modalAction = 'end';

    this.modal.present();
  }

  requestDeletingPitch() {
    this.modalMessage = "Deleting your Pitch will permanantly remove it from the public, this means funds raised via the platform will be refunded to respective contributors.";
    this.modalRemarks = "Remember: This action cannot be reversed. Contributors will be notified and refunded.";
    this.modalAction = 'delete';

    this.modal.present();
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    const loaderIdx = this.loaderService.showLoader();
    this.modal.dismiss(this?.data.key, 'confirm');
    
    this.finalizeEndingDeleting();
  }

  finalizeEndingDeleting() {
    superagent
      .post([environment.farmhouse, 'pitches', this.data?.key, 'admin-actions', this.modalAction].join('/'))
      .set('Authorization', ['Bearer', this.sessionService.sessionToken].join(' '))
      .end((_, response) => {
        if (response) {
          if (response.statusCode === 200) {
            this.toastService.show(this.modalAction === 'end' ? 'Pitch successfully ended.' : 'Pitch has been succesfully and permenantly deleted.');
            if (this.modalAction === 'end') {
              this.data.has_ended = true;
            }
          }
        }
      })
  }
}
