import { Component, OnInit } from '@angular/core';
import { IEgg } from 'src/app/interfaces/IEgg';
import { IHetcher } from 'src/app/interfaces/IHetcher';
import { CurrencyResolverService } from 'src/app/services/currency-resolver.service';
import { EggService } from 'src/app/services/egg.service';
import { LoaderService } from 'src/app/services/loader.service';
import { RouterService } from 'src/app/services/router.service';
import { SessionService } from 'src/app/services/session.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import * as timeago from 'timeago.js';

@Component({
  selector: 'app-recently-viewed-egg',
  templateUrl: './recently-viewed-egg.component.html',
  styleUrls: ['./recently-viewed-egg.component.scss'],
})
export class RecentlyViewedEggComponent implements OnInit {
  has_recently_viewed = false;
  is_closed = false; // Active when user closes this component
  isLoading = true;
  recently_viewed_id;
  data: IEgg;

  constructor(
    public currencyResolver: CurrencyResolverService,
    public loaderService: LoaderService,
    public toastManager: ToastManagerService,
    private sessionService: SessionService,
    private eggService: EggService,
    private routerService: RouterService
  ) {}

  ngOnInit() {
    // Incase the session data is already loaded.
    this.setUp(this.sessionService.data);

    // If session data is not loaded yet, subscribe to changes when it happens.
    this.sessionService.sessionDataSubject.subscribe((sessionData) => {
      this.setUp(sessionData);
    });
  }

  setUp(sessionData: IHetcher): void {
    if (sessionData) {
      this.has_recently_viewed =
        sessionData?.recently_viewed.length > 0 || false;
      if (this.has_recently_viewed) {
        this.recently_viewed_id =
          sessionData?.recently_viewed[sessionData?.recently_viewed.length - 1];
        this.eggService.get(this.recently_viewed_id).then((data: IEgg) => {
          this.data = data;
          this.isLoading = false;
        });
      }
    }
  }

  truncate(input) {
    const MAX_LENGTH = 100;

    if (input.length > MAX_LENGTH) {
      return input.substring(0, MAX_LENGTH) + '...';
    }

    return input;
  }

  getPitchExpiry() {
    // Calculate the days left to fund this pitch.
    // const endingTimestamp = this.data?.ending_timestamp || 0,
    //   startTimestamp = this.data?.approval_date?.timestamp || 0;

    // const timestampsDelta = endingTimestamp - startTimestamp,
    //   daysLeft = Math.floor(timestampsDelta / 86400),
    //   hoursLeft = Math.floor(timestampsDelta / 3600) % 24,
    //   minutesLeft = Math.floor(timestampsDelta / 60) % 60;

    // return {
    //   days: daysLeft,
    //   hours: hoursLeft,
    //   minutes: minutesLeft,
    // };
    const endingDate = new Date(this.data?.ending_timestamp * 1000);
    return timeago.format(endingDate);
  }

  commitPledge() {
    this.routerService.route(['pitches', this.data?.key, 'contribution']);
  }
}
