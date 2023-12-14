import {
  AfterContentChecked,
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CurrencyResolverService } from 'src/app/services/currency-resolver.service';
import { EggService } from 'src/app/services/egg.service';
import { SessionService } from 'src/app/services/session.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';
import * as nanoid from 'nanoid';
import { RouterService } from 'src/app/services/router.service';
import { TitleService } from 'src/app/services/title.service';

// UPLOADCARE API INTERGRATION.
import { UploadClient } from '@uploadcare/upload-client'
import { LoaderService } from 'src/app/services/loader.service';
const uploadcareClient = new UploadClient({ publicKey: environment.UPLOADCARE_PUBLIC_KEY })

@Component({
  selector: 'app-create-rewards',
  templateUrl: './create-rewards.page.html',
  styleUrls: ['./create-rewards.page.scss'],
})
export class CreateRewardsPage implements OnInit, AfterViewInit {
  @ViewChild('RewardThumbnail')
  rewardThumbnailSelector: ElementRef<HTMLInputElement>;
  @ViewChild('RewardsTypeInput') rewardsTypeInput: ElementRef<HTMLSelectElement>;
  @ViewChild('TotalAuthorizedSharesInput') totalAuthorizedSharesInput: ElementRef<HTMLInputElement>;
  @ViewChild('NonfinancialRewardsSection') nonfinancialRewardsSection: ElementRef<HTMLDivElement>;
  @ViewChild('RewardOptions') rewardOptions: ElementRef<HTMLDivElement>;

  // Helpers
  window = window;

  draft;
  draft_key;

  // Reward fields.
  rewardsType: string = "shares";
  totalAuthorizedShares: string = "10000"

  rewardTitle: string;
  rewardDescription: string;
  rewardAvailability: string = 'available';
  availableQuantity: string = '';
  rewardShipsTo: string = 'anywhere';
  rewardContributionAmount: string;
  rewardThumbnail: { filename?: string; cdnUrl?: string; name?: string } = null;


  rewardThumbnailUploadProgress = 0;
  isUploadingRewardThumbnail = false;
  isUploadedRewardThumbnail = false;

  selectedEditId: number;
  isEditMode = false;

  hasUnsavedChanges = false;

  rewards = [];

  constructor(
    public currencyService: CurrencyResolverService,
    private loaderService: LoaderService,
    private toastService: ToastManagerService,
    private sessionService: SessionService,
    private activatedRoute: ActivatedRoute,
    private pitchService: EggService,
    private routerService: RouterService,
    private titleService: TitleService
  ) {}

  ngOnInit() {
    this.titleService.onTitleChange.next('Pitch rewards | Create: Hetchfund');

    this.activatedRoute.queryParamMap.subscribe((queryParams) => {
      this.draft_key = queryParams.get('draft_key');

      // To retrieve the draft progress data.
      this.pitchService.getSavedDraft(this.draft_key).then((draft) => {
        this.draft = draft;
        this.totalAuthorizedShares = this.draft?.total_authorized_shares;

        this.rewardsType = this.draft?.rewards_type;
        document.getElementById(this.rewardsType)?.setAttribute("selected", "selected");
        if (this.rewardsType === "non-shares") {
          this.nonfinancialRewardsSection.nativeElement.hidden = false;
          this.rewardOptions.nativeElement.hidden = false;
          this.totalAuthorizedSharesInput.nativeElement.hidden = true;
        }
      });

      // Retrieve the pitch rewards.
      this.pitchService
        .getPitchRewards(this.draft_key)
        .then((rewards: any) => (this.rewards = rewards));
    });
  }

  ngAfterViewInit() {
    this.rewardThumbnailSelector.nativeElement.onchange = (_) => {
      this.uploadFile(this.rewardThumbnailSelector.nativeElement.files[0]);
    };

    this.rewardsTypeInput.nativeElement.onchange = (_) => {
      if (this.rewardsTypeInput.nativeElement.value === "non-shares") {
        this.totalAuthorizedSharesInput.nativeElement.hidden = true;
        this.nonfinancialRewardsSection.nativeElement.hidden = false;
        this.rewardOptions.nativeElement.hidden = false;
      } else {
        this.totalAuthorizedSharesInput.nativeElement.hidden = false;
        this.nonfinancialRewardsSection.nativeElement.hidden = true;
        this.rewardOptions.nativeElement.hidden = true;
      }
    }

    this.applyRewardsTypeSectionsFormat()
  }

  applyRewardsTypeSectionsFormat() {
    if (this.rewardsType === "non-shares") {
      this.nonfinancialRewardsSection.nativeElement.hidden = false;
      this.rewardOptions.nativeElement.hidden = false;
    }
  }

  addReward() {
    this.rewards.push({
      id: nanoid.nanoid(5),
      name: this.rewardTitle,
      description: this.rewardDescription,
      contribution_amount: this.rewardContributionAmount,
      availability: this.rewardAvailability,
      ships_to: this.rewardShipsTo,
      thumbnail: this.rewardThumbnail.cdnUrl,
      thumbnail_filename: this.rewardThumbnail.filename,
    });

    this.resetInputFields();
  }

  editReward(id: number) {
    if (!this.isEditMode) {
      this.selectedEditId = id;
      this.isEditMode = true;

      const reward = this.rewards.find((r) => r.id == id);

      this.rewardTitle = reward.name;
      this.rewardDescription = reward.description;
      this.rewardContributionAmount = reward.contribution_amount;
      this.rewardAvailability = reward.availability;
      this.rewardShipsTo = reward.ships_to;
      this.rewardThumbnail = {
        cdnUrl: reward.thumbnail,
        filename: reward.thumbnail_filename,
      };
      this.rewardThumbnailSelector.nativeElement.files[0] = new File(
        [],
        this.rewardThumbnail.filename
      );
    } else {
      this.toastService.show('Edit mode is already active.');
    }
  }

  deleteReward(id: number) {
    const rewardIndex = this.rewards.findIndex((r) => r.id === id);
    if (rewardIndex !== -1) {
      this.rewards.splice(rewardIndex, 1);
      return this.toastService.show('Reward has been deleted.');
    }
    return this.toastService.show('Reward does not exist.');
  }

  saveRewardEdits() {
    const rewardIndex = this.rewards.findIndex(
      (r) => r.id == this.selectedEditId
    );

    this.rewards[rewardIndex] = {
      id: this.selectedEditId,
      name: this.rewardTitle,
      description: this.rewardDescription,
      contribution_amount: this.rewardContributionAmount,
      availability: this.rewardAvailability,
      ships_to: this.rewardShipsTo,
      thumbnail: this.rewardThumbnail.cdnUrl,
      thumbnail_filename: this.rewardThumbnail.filename,
    };

    this.resetInputFields();

    // Reset edit mode.
    this.isEditMode = false;
    this.selectedEditId = null;

    // Show edited note.
    this.toastService.show('Changes saved.');
  }

  // Sets and saves the rewards in the database for review.
  setRewards(isFromButton = false) {
    const loaderId = this.loaderService.showLoader();
    
    return new Promise((resolve, reject) => {
      superagent
        .post([environment.farmhouse, 'rewards'].join('/'))
        .set(
          'Authorization',
          ['Bearer', this.sessionService.sessionToken].join(' ')
        )
        .send({
          reward_options: this.rewards,
          _for: this.draft_key,
        })
        .end((_, response) => {
          this.loaderService.hideLoader(loaderId);

          if (response) {
            if (response.statusCode === 200) {
              this.rewards = response.body.data.reward_options;

              // Save the draft progress as well.
              this.pitchService
                .saveDraftEdits({
                  key: this.draft_key,
                  total_authorized_shares: parseFloat(this.totalAuthorizedShares),
                  rewards_type: this.rewardsType,
                  draft_progress: {
                    rewards: {
                      required: true,
                      value: this.rewards.length > 0,
                    },
                  },
                })
                .then(() => {
                  this.toastService.show("Rewards updated.");
                  if (isFromButton) {
                    this.routerService.route(
                      ['pitches', 'create', 'curators'],
                      {
                        draft_key: this.draft_key,
                      }
                    );
                  }
                });
            } else {
              this.toastService.show(
                response.body.reason ||
                  'Something went wrong. Please try again, if issue persists contact us.'
              );
            }
          } else {
            this.toastService.show('Please check your internet connection.');
          }
        });
    });
  }

  resetInputFields() {
    // Input fields.
    this.rewardTitle = '';
    this.rewardDescription = '';
    this.rewardContributionAmount = '';
    this.rewardThumbnailSelector.nativeElement.files = null;

    this.rewardThumbnail = null;

    // Select options.
    this.rewardAvailability = 'limited';
    this.rewardShipsTo = 'anywhere';
  }

  uploadFile(file: File) {
    this.isUploadingRewardThumbnail = true;

    uploadcareClient.uploadFile(file).then((uploadResult: any) => {
      console.log("File uploaded: ", uploadResult)
      this.isUploadingRewardThumbnail = false;
        if (uploadResult) {
          this.isUploadedRewardThumbnail = true;
          uploadResult.url = uploadResult.cdnUrl;
          this.rewardThumbnail = uploadResult;
        } else {
          this.isUploadedRewardThumbnail = false;
        }
    }).catch((error) => {
      console.log("File upload failed: ", error);
      this.toastService.show("Something went wrong while uploading.");
    })
  }

  toInteger(number: string): number {
    return parseFloat(number);
  }
}
