import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ERROR_MESSAGES } from 'src/app/error_messages';
import { EggService } from 'src/app/services/egg.service';
import { RouterService } from 'src/app/services/router.service';
import { SessionService } from 'src/app/services/session.service';
import { TitleService } from 'src/app/services/title.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';

// UPLOADCARE API INTERGRATION.
import { UploadClient } from '@uploadcare/upload-client'
const uploadcareClient = new UploadClient({ publicKey: environment.UPLOADCARE_PUBLIC_KEY })

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit, AfterViewInit {
  @ViewChild('PrimaryCategory') primaryCategory: ElementRef<HTMLSelectElement>;
  @ViewChild('SecondaryCategory')
  secondaryCategory: ElementRef<HTMLSelectElement>;
  @ViewChild('CountrySelector')
  countrySelector: ElementRef<HTMLSelectElement>;
  @ViewChild('ProvinceSelector')
  provinceSelector: ElementRef<HTMLSelectElement>;

  constructor(
    private titleService: TitleService,
    private sessionService: SessionService,
    public eggService: EggService,
    private toastService: ToastManagerService,
    private activatedRoute: ActivatedRoute,
    private routerService: RouterService
  ) {}

  isLoading = true;
  islivepitch = false;

  primaryCategories = [];
  categories = [];

  categoryKeys = [];
  isisUnableToLoadCategories = false;

  countries = [];
  selectedCountry: string;
  provinces = {};
  selectedProvince: string;

  selectedPlaceholder: any = null;
  isPlaceholderUploaded = false;
  isPlaceholderUploading = false;
  placeholderUploadProgress = 0;

  selectedPresentationVideo: any = null;
  isPresentationVideoUploading = false;
  isPresentationVideoUploaded = false;
  presentationVideoUploadProgress = 0;

  draft_key: string;
  basicPitch: any = {};

  ngOnInit() {
    this.titleService.onTitleChange.next('Pitch Create | Basics: Hetchfund.com');
    // Loading categories
    superagent
      .get([environment.farmhouse, 'categories'].join('/'))
      .end((_, response) => {
        this.isLoading = false;
        if (response.statusCode == 200) {
          if (response.body.data) {
            this.primaryCategories = Object.keys(response.body.data);
            this.categories = response.body.data;
          }
          this.isisUnableToLoadCategories = false;
        } else {
          this.isisUnableToLoadCategories = true;
        }
      });

    // Loading countries and provinces
    this.isLoading = true;
    superagent
      .get([environment.farmhouse, 'countries'].join('/'))
      .end((_, response) => {
        this.isLoading = false;
        if (response.statusCode == 200) {
          if (response.body.data) {
            this.countries = Object.keys(response.body.data);

            // Flatten the array recieived back.
            this.provinces = response.body.data;
          }

          this.isisUnableToLoadCategories = false;
        } else {
          this.isisUnableToLoadCategories = true;
        }
      });

    // Load the draft pitch if continueing to edit
    this.activatedRoute.queryParamMap.subscribe((queryParams) => {
      this.draft_key = queryParams.get('draft_key') || queryParams.get('pitch_key');
      this.islivepitch = queryParams.get('islive') === '1' ? true : false;

      // Pull the draft from the backend
      this.eggService.get(this.draft_key, { isDraft: !this.islivepitch })
        .then((data) => {
          this.basicPitch = data;
          setTimeout(() => {
            if (this.basicPitch.primary_category) {
              this.primaryCategory.nativeElement.value = this.basicPitch.primary_category;
            }

            if (this.basicPitch.country_published) {
              this.selectedCountry = this.basicPitch.country_published;
              this.countrySelector.nativeElement.value = this.basicPitch.country_published;
            }

            // Load the thumbnail and placeholder images.
            if (this.basicPitch.thumbnail_url)
              this.selectedPlaceholder = {
                cdnUrl: this.basicPitch.thumbnail_url,
              };
            if (this.basicPitch.presentation_video)
              this.selectedPresentationVideo = {
                cdnUrl: this.basicPitch.presentation_video,
              };
          }, 100);
        })
    });
  }

  uploadFile(file: File, isPlaceholderImage: boolean = true) {
    if (isPlaceholderImage) {
      this.selectedPlaceholder = file;
      this.isPlaceholderUploading = true;
    } else {
      this.selectedPresentationVideo = file;
      this.isPresentationVideoUploading = true;
    }

    uploadcareClient.uploadFile(file, { onProgress: (event: any) => {
      if (isPlaceholderImage) {
        this.placeholderUploadProgress = event.value * 100;
        this.isPlaceholderUploading = false;
      } else {
        this.presentationVideoUploadProgress = event.value * 100;
      }

      console.log("File upload update: ", event);
    }}).then((uploadResult) => {
      console.log("File uploaded: ", uploadResult)
      if (uploadResult) {
        if (uploadResult?.cdnUrl) {
          if (isPlaceholderImage) {
            this.selectedPlaceholder = uploadResult;
            this.basicPitch['thumbnail_url'] = uploadResult.cdnUrl;
          } else {
            this.selectedPresentationVideo = uploadResult;
            this.basicPitch['presentation_video'] = uploadResult.cdnUrl;
            this.isPresentationVideoUploading = false;
            this.isPresentationVideoUploaded = true;
          }
        }
      }
    }).catch((error) => {
      console.log("File upload failed: ", error);
      this.toastService.show("Something went wrong while uploading.");
    })
  }

  setSelectValue(field, value): void {
    this.basicPitch[field] = value;
    if (field === 'country_published') {
      this.selectedCountry = value;
    }
  }

  // Check if this step should be marked as completed.
  checkCompleteness() {
    return {
      basic: {
        required: true,
        value:
          this.basicPitch.name &&
          this.basicPitch.brief_description &&
          this.basicPitch.funding_purpose &&
          this.basicPitch.country_published &&
          this.basicPitch.province_published &&
          this.basicPitch.thumbnail_url &&
          this.basicPitch.primary_category
            ? true
            : false,
      },
    };
  }

  createDraftPitch() {
    // Check if this step should be marked as completed.
    // this.basicPitch.draft_progress = this.checkCompleteness();
    console.log(this.basicPitch);
    if (this.basicPitch.name) {
      return new Promise((resolve, reject) => {
        superagent
          .post([environment.farmhouse, 'pitch', 'draft'].join('/'))
          .set(
            'Authorization',
            ['Bearer', this.sessionService.sessionToken].join(' ')
          )
          .send(this.basicPitch)
          .end((_, response) => {
            if (response) {
              if (response.statusCode === 200) {
                const a = document.createElement('a');
                a.href = [
                  '/pitches/create/basics?draft_key=',
                  response.body.data.key,
                ].join('');
                a.click();

                resolve(response);
              } else {
                this.toastService.show(
                  response.body.reason || ERROR_MESSAGES.UNEXPECTED_ERROR
                );
              }
            } else {
              this.toastService.show(ERROR_MESSAGES.NO_INTERNET);
            }
          });
      });
    } else {
      this.toastService.show('To create a pitch draft, a name is required.');
    }
  }

  saveDraftEdits() {
    this.basicPitch.draft_progress = this.checkCompleteness();

    return this.eggService
      .saveDraftEdits({
        key: this.draft_key,
        name: this.basicPitch?.name,
        brief_description: this.basicPitch?.brief_description,
        thumbnail_url: this.selectedPlaceholder?.cdnUrl,
        country_published: this.basicPitch?.country_published,
        province_published: this.basicPitch?.province_published,
        funding_purpose: this.basicPitch?.funding_purpose,
        primary_category: this.basicPitch?.primary_category,
        secondary_category: this.basicPitch?.secondary_category,
        presentation_video: this.basicPitch?.presentation_video,
      })
      .then(() => {
        // this.routerService.route(['pitches', 'create', 'story'], {
        //   draft_key: this.basicPitch.key,
        // });
      });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const selectedProvinceOption = document.getElementById(
        this.basicPitch.province_published?.replace(' ', ' ')
      );
      if (selectedProvinceOption)
        selectedProvinceOption.setAttribute('selected', 'selected');

      // Set the secondary category if it has been set.
      const selectedSecondaryCategoryOption = document.getElementById(
        this.basicPitch.secondary_category
      );
      if (selectedSecondaryCategoryOption)
        selectedSecondaryCategoryOption.setAttribute('selected', 'selected');
    }, 3000);
  }

  log(text) {
    console.log(text);
  }
}
