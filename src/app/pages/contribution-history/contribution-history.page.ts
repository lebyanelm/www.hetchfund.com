import { Component, OnInit } from '@angular/core';
import { CurrencyResolverService } from 'src/app/services/currency-resolver.service';
import { RouterService } from 'src/app/services/router.service';
import { SessionService } from 'src/app/services/session.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';

@Component({
  selector: 'app-contribution-history',
  templateUrl: './contribution-history.page.html',
  styleUrls: ['./contribution-history.page.scss'],
})
export class ContributionHistoryPage implements OnInit {
  activeHueristicFilter = 'all';

  // PAGE DETAILS
  current_page = 1;
  next_page = this.current_page + 1;
  results_per_page = 1;
  results = [];
  results_available = 0;
  results_left = 0;

  constructor(
    public currencyService: CurrencyResolverService,
    private routerService: RouterService,
    private sessionService: SessionService,
    private toastService: ToastManagerService
  ) {}

  ngOnInit() {
    // LOAD TRANSACTIONS ACORDING TO HUERISTICS AND PAGE NUMBER
    superagent
      .get(
        [
          environment.farmhouse,
          'pitches',
          'contributions?',
          `page=${this.current_page}&per_page=${this.results_per_page}`,
        ].join('/')
      )
      .set(
        'Authorization',
        ['Bearer', this.sessionService.sessionToken].join(' ')
      )
      .end((_, response) => {
        if (response) {
          this.results = response.body?.data?.results ?? [];
          this.results_available = response.body?.data?.results_available;
          this.results_left = response.body?.data?.results_left;
          this.next_page = response.body?.data?.next_page;
        } else {
          this.toastService.show(
            'Something went wrong when fetching transactions.'
          );
        }
      });
  }

  setHueristicFilter(hueristicFilter: string): void {
    if (hueristicFilter) this.activeHueristicFilter = hueristicFilter;
  }

  openTransaction(transactionId: string): void {
    if (transactionId)
      this.routerService.route(['history', 'contributions', transactionId]);
  }

  nextPage() {
    this.current_page += 1;
  }
}
