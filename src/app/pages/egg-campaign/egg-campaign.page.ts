import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
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

@Component({
  selector: 'app-egg-campaign',
  templateUrl: './egg-campaign.page.html',
  styleUrls: ['./egg-campaign.page.scss'],
})
export class EggCampaignPage implements OnInit {
  @ViewChild('StoryBody') storyBody: CustomRichTextEditorComponent;

  eggKey: string;
  data: IEgg;
  sessionToken: string;
  href = window.location.href;

  isbookmarked = false;
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
    private meta: Meta
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params) => {
      // Get the data of the pitch from the backend
      this.eggKey = params.get('pitch_key');

      this.eggService.get(this.eggKey, true).then((data: IEgg) => {
        this.data = data;

        // Load query params data for processing.
        this.activatedRoute.queryParamMap.subscribe((queryParams) => {
          this.activeTab = queryParams.get("tab") || "story";
          // Re-activate Editor.js element.
          if (this.activeTab == 'about') {
            setTimeout(() => {
              if (this.storyBody) {
                this.storyBody.setData(this.data?.story);
              }
            }, 50); // Wait 50ms for the UI to re-render.
          }
        });
        
        this.storyBody.setData(this.data?.story);

        // TODO: Find ways to do SEO
        this.isbookmarked = this.data?.bookmarks.includes(
          this.sessionService.data?.email_address
        );
        this.isLoadingBookmark = false;

        // Change the title of the page.
        this.titleService.onTitleChange.next(
          [this.data?.funding_purpose || this.data?.name, 'Hetchfund'].join(
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
    alert(this.currentMediaFile)
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

  URLEncode(item: string) {
    return encodeURIComponent(item);
  }
}
