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
import { IdentityVerificationModalComponent } from '../components/identity-verification-modal/identity-verification-modal.component';
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
  ) {
    
  }

  

  ngOnInit(): void {
    this.titleService.onTitleChange.next('Browse pitches | Hetchfund');
  // Find the featured pitches and pick a random one.
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

  async ngAfterViewInit() {
    
  }
}
