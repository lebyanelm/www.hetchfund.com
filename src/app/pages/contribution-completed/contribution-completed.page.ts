import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EggService } from 'src/app/services/egg.service';
import { RouterService } from 'src/app/services/router.service';
import { SessionService } from 'src/app/services/session.service';
import { TitleService } from 'src/app/services/title.service';

@Component({
  selector: 'app-contribution-completed',
  templateUrl: './contribution-completed.page.html',
  styleUrls: ['./contribution-completed.page.scss'],
})
export class ContributionCompletedPage implements OnInit {
  pitchKey: string;
  contributionId: string;

  constructor(
    private title: TitleService,
    public sessionService: SessionService,
    private eggService: EggService,
    private activatedRoute: ActivatedRoute,
    private routerService: RouterService
  ) {}

  ngOnInit() {
    this.title.onTitleChange.next(
      'Contribution succesfully processed | Hetchfund.com'
    );
    this.activatedRoute.paramMap.subscribe((params) => [
      this.activatedRoute.queryParamMap.subscribe((queryParams) => {
        this.pitchKey = params.get('pitch_key');
        this.contributionId = queryParams.get('contribution_id');
      }),
    ]);
  }

  backToPitch() {
    this.routerService.route(['pitches', this.pitchKey]);
  }

  goToHome() {
    this.routerService.route(['pitches']);
  }
}
