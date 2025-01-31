import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonSlides } from '@ionic/angular';
import { UploadClient } from '@uploadcare/upload-client';
import { nanoid } from 'nanoid';
import { ERROR_MESSAGES } from 'src/app/error_messages';
import { SessionService } from 'src/app/services/session.service';
import { TitleService } from 'src/app/services/title.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';
const uploadcareClient = new UploadClient({ publicKey: environment.UPLOADCARE_PUBLIC_KEY })

@Component({
  selector: 'app-identity-kyc-verification',
  templateUrl: './identity-kyc-verification.page.html',
  styleUrls: ['./identity-kyc-verification.page.scss'],
})
export class IdentityKycVerificationPage implements OnInit, AfterViewInit {
  @ViewChild("IonSlides") ionSlides: IonSlides;
  @ViewChild("CanvasElement") canvasElement: ElementRef<HTMLCanvasElement>;
  @ViewChild("ReviewSnapshotContainer") reviewSnapshotContainer: ElementRef<HTMLDivElement>;

  slides = [];
  isLoading: boolean;
  countries: string[];
  selectedCountry: string = "South Africa";
  provinces: any;
  selectedProvince: string = "";
  isisUnableToLoadCategories: boolean;

  activatedMediaStream: MediaStream;
  activeSlideIndex: number = 0;
  isReachedSlideEnd: boolean = false;
  isReachedSlideStart: boolean = true;
  isFrontCapture: boolean = true;

  // Selfie that was taken and saved.
  selfieSnapshot: File | string;
  idFrontSnapshot: File | string;
  idBackSnapshot: File | string;
  canvasCtx: CanvasRenderingContext2D;
  videoElement: HTMLVideoElement;
  snapshotStep: string = 'selfie';

  isCompleted = false;
  hetcher_uid;

  constructor(
    private titleService: TitleService,
    private sessionService: SessionService,
    private toastService: ToastManagerService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.titleService.onTitleChange.next("Real-person Verification (KYC) | Hetchfund.com")

    this.activatedRoute.queryParamMap.subscribe((queryParams) => {
      this.hetcher_uid = queryParams.get("uid");
    });

    // Get supported countries and provinces.
    superagent
      .get([environment.farmhouse, 'countries'].join('/'))
      .end((_, response) => {
        this.isLoading = false;
        if (response.statusCode == 200) {
          if (response.body.data) {
            this.countries = Object.keys(response.body.data);
            // Flatten the array recieived back.
            this.provinces = response.body.data;
            console.log(this.provinces)
          }
          this.isisUnableToLoadCategories = false;
        } else {
          this.isisUnableToLoadCategories = true;
        }
    });
  }

  ngAfterViewInit(): void {
    // Lock the slides to prevent user from sliding themselves.
    this.ionSlides.lockSwipes(true);
    
    // Build all indices of slides available.
    this.ionSlides.length().then((slidesLength) => {
      for (let slideIndex = 0; slideIndex <= slidesLength-1; slideIndex++) {
        this.slides.push(slideIndex);
      }
    });

    // Subscribe to changes of the slides to get the active slide.
    this.ionSlides.ionSlideDidChange.subscribe(() => {
      this.ionSlides.getActiveIndex().then((slideIndex) => {
        this.activeSlideIndex = slideIndex;
        
        // When the slide end or start has been reached.
        this.isReachedSlideEnd = this.activeSlideIndex === this.slides.length-1;
        this.isReachedSlideStart = this.activeSlideIndex === 0;

        // Check if the User Media is needed in this slide.
        if ([2].includes(this.activeSlideIndex)) {
          if (this.activeSlideIndex === 2) {
            this.startCameraMediaStream({
              height: 280,
              width: 200
            });
          }
        }

        // To stop the media camera stream.
        if ([4].includes(this.activeSlideIndex)) {
          this.stopCameraMediaStream();
        }
      })

      // Lock the slide after sliding it.
      this.ionSlides.lockSwipes(true);
    })
  }

  startCameraMediaStream(videoOpts: { direction?: string, width?: number, height?: number } = {}) {
    window.navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: videoOpts.width },
        height: { ideal: videoOpts.height },
        facingMode: videoOpts.direction || "user"
      }
    }).then((mediaStream) => {
      this.activatedMediaStream = mediaStream;

      // Paint the canvas with the frames.
      if (!this.selfieSnapshot) {
        this.videoElement = document.getElementsByTagName("video")[0];
        this.snapshotStep = 'selfie';
      } else {
        this.videoElement = document.getElementsByTagName("video")[1];
        this.snapshotStep = this.idFrontSnapshot ? 'id_back' : 'id_front';
      }

      console.log(this.videoElement)

      // Set the video stream.
      this.videoElement.srcObject = mediaStream;
      
      // Set the canvas context for getting the frames.\
      this.videoElement.onloadedmetadata = () => {
        this.canvasElement.nativeElement.height = this.videoElement.videoHeight;
        this.canvasElement.nativeElement.width = this.videoElement.videoWidth;
        this.canvasCtx = this.canvasElement.nativeElement.getContext("2d");
      };
    });
  }

  captureMediaSnapshot() {
    this.canvasCtx.drawImage(this.videoElement, 0, 0);
    const dataUri = this.dataURLtoFile(this.canvasElement.nativeElement.toDataURL('image/jpg', 1))
    if (this.snapshotStep === 'selfie') this.selfieSnapshot = dataUri;
    if (this.snapshotStep === 'id_front') this.idFrontSnapshot = dataUri;
    if (this.snapshotStep === 'id_back') this.idBackSnapshot = dataUri;

    this.reviewSnapshotContainer.nativeElement.style.backgroundImage = ['url(', this.canvasElement.nativeElement.toDataURL('image/jpg', 1),')'].join('');
    this.reviewSnapshotContainer.nativeElement.style.height = this.canvasElement.nativeElement.height + "px";
    this.reviewSnapshotContainer.nativeElement.style.width = this.canvasElement.nativeElement.width + "px";
    
    this.nextSlide(4);
  }

  stopCameraMediaStream() {
    if (this.activatedMediaStream && this.activatedMediaStream?.active) {
      this.activatedMediaStream.getVideoTracks()[0].stop();
    }
  }

  saveSnapshotMedia(type: string | 'selfie' | 'id_front' | 'id_back') {
    this.stopCameraMediaStream();
    
    let selectedMediaData;
    if (type === 'selfie') {
      selectedMediaData = this.selfieSnapshot;
    } else if (type === 'id_front') {
      selectedMediaData = this.idFrontSnapshot;
    } else {
      selectedMediaData = this.idBackSnapshot;
    }
    
    uploadcareClient.uploadFile(selectedMediaData).then((uploadResponse) => {
      if (type === 'selfie') {
        this.selfieSnapshot = uploadResponse.cdnUrl;
        this.snapshotStep = 'id_front';
        this.nextSlide();
      } else if (type === 'id_front') {
        this.idFrontSnapshot = uploadResponse.cdnUrl;
        this.snapshotStep = 'id_back';
        this.nextSlide(6);
      } else {
        this.idBackSnapshot = uploadResponse.cdnUrl;
        
        // Todo: Finalize and send te data to the backend for processing.
        const kyc_params = {
          country: this.selectedCountry,
          province: this.selectedProvince,
          selfie: this.selfieSnapshot,
          id_front: this.idFrontSnapshot,
          id_back: this.idBackSnapshot,
          hetcher_uid: this.hetcher_uid
        }

        superagent
          .post([environment.accounts, 'verifications', 'kyc-submissions'].join('/'))
          .set("Authorization", ["Bearer", this.sessionService.sessionToken].join(' '))
          .send(kyc_params)
          .end((_, response) => {
            if (response) {
              if (response.statusCode === 200) {
                this.isCompleted = true;
                this.nextSlide(7);
              } else {
                this.toastService.show(response.body.reason || "Something went wrong, try again.", true, true);
              }
            } else {
              this.toastService.show(ERROR_MESSAGES.NO_INTERNET, true, true);
            }
          });
        
      }

      // Finally restart the media stream if there's more upload jobs.
      if (!this.selfieSnapshot || !this.idBackSnapshot || !this.idFrontSnapshot) {
        this.startCameraMediaStream(
          this.snapshotStep === 'id_front' || this.snapshotStep === 'id_back' ?
            { height: 200, width: 300, direction: 'environment' } : { height: 280, width: 200, direction: 'user' });
      }
    });
  }

  dataURLtoFile(dataurl: string): File {
      var arr = dataurl.split(','),
          mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[arr.length - 1]), 
          n = bstr.length, 
          u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], [nanoid(), 'jpg'].join('.'), { type: mime });
  }

  nextSlide(slideIndex: number = -1) {
    if (!this.isReachedSlideEnd) {
      this.ionSlides.lockSwipes(false);
      if (slideIndex > -1) {
        this.ionSlides.slideTo(slideIndex, 400, true);
      } else {
        this.ionSlides.slideNext();
      }
    }
  }
  
  previousSlide() {
    if (!this.isReachedSlideStart) {
      this.ionSlides.lockSwipes(false);
      this.ionSlides.slidePrev();
    }
  }
}
