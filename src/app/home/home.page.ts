import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TitleService } from '../services/title.service';
import * as superagent from 'superagent';
import { SessionService } from '../services/session.service';
import { environment } from 'src/environments/environment';
import { ToastManagerService } from '../services/toast-manager.service';
import { IEgg } from '../interfaces/IEgg';
import { CurrencyResolverService } from '../services/currency-resolver.service';
import { EggService } from '../services/egg.service';
import { Swiper } from 'swiper';

// import function to register Swiper custom elements
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {
  featured: IEgg = null;
  recommended = {};
  recommended_sections = [];

  sliderBreakpoints = {
    360: {
      slidesPerView: 1,
    },
    520: {
      slidesPerView: 2,
      spaceBetween: 0
    },
    960: {
      slidesPerView: 3
    },
    1285: {
      slidesPerView: 4
    }
  }

  isLoadingRecommended = false;
  isLoadingError = false;
  constructor(
    private titleService: TitleService,
    private sessionService: SessionService,
    private toastService: ToastManagerService,
    private pitchesService: EggService,
    public currencyResolver: CurrencyResolverService
  ) {}

  

  ngOnInit(): void {
    this.titleService.onTitleChange.next('Browse pitches | Hetchfund');
    // Find the featured pitch.
    this.pitchesService.getFeatured(1).then((featuredPitchs: []) => {
      const randomFeaturedIndex = Math.floor(
        Math.random() * featuredPitchs.length
      );
      this.featured = featuredPitchs[randomFeaturedIndex];
    });

    // Get recommended campainging eggs
    let sessionToken = this.sessionService.sessionToken;
    if (sessionToken) {
      sessionToken = ['Bearer', sessionToken].join(' ');
    } else {
      sessionToken = null;
    }

    this.isLoadingRecommended = true;
    superagent
      .get([environment.farmhouse, 'recommended'].join('/'))
      .set('Authorization', sessionToken)
      .end((_, response) => {
        this.isLoadingRecommended = false;
        if (response) {
          if (response.statusCode == 200) {
            this.recommended = response.body.data;
            this.recommended_sections = Object.keys(this.recommended);
          } else {
            this.isLoadingError = true;
            this.toastService.show(
              response.body.data.reason || 'Something went wrong.'
            );
          }
        } else {
          this.isLoadingError = true;
          this.toastService.show("You're not connected to the internet.");
        }
      });
  }

  ngAfterViewInit(): void {
    // Select the swiper reference container.
    const swiperReferenceElement = setInterval(() => {
      const swiperContainer = document.querySelector("swiper-container");
      if (swiperContainer) {
        clearInterval(swiperReferenceElement);
        const swiperRef = swiperContainer.swiper;
        swiperRef.setBreakpoint()

        swiperRef.on("slideChange", () => {
          checkButtonDisability();
        });

        const nextSlideButton: HTMLDivElement = document.querySelector(".swiper-next-slide"),
            prevSlideButton: HTMLDivElement = document.querySelector(".swiper-prev-slide");

        // Add next, prev events on the custom navigation buttons.
        if (nextSlideButton && prevSlideButton && swiperRef) {
          nextSlideButton.onclick = () => {
            swiperRef.slideNext();
          };
          prevSlideButton.onclick = () => {
            swiperRef.slidePrev();
          };
        }

        function checkButtonDisability() {
          // Next button.
          if (swiperRef.slides.length - 1 === swiperRef.activeIndex) {
            nextSlideButton.setAttribute('data-disabled', 'true');
            prevSlideButton.setAttribute('data-disabled', 'true');
          } else {
            nextSlideButton.setAttribute('data-disabled', 'false');
          }

          // Previous button.
          if (swiperRef.activeIndex === 0) {
            prevSlideButton.setAttribute('data-disabled', 'true');
          } else {
            prevSlideButton.setAttribute('data-disabled', 'false');
          }
        }
      }
    }, 500);
  }
}
