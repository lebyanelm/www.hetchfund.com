import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { IEgg } from 'src/app/interfaces/IEgg';
import { EggService } from 'src/app/services/egg.service';
import { TitleService } from 'src/app/services/title.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.page.html',
  styleUrls: ['./not-found.page.scss'],
  providers: [],
})
export class NotFoundPage implements OnInit {
  error_code = 500;
  error_title = 'Something went wrong';
  error_message =
    'We are experiencing \
                difficulties handling your request at the moment.';

  // Incase the user hit a deadend
  isLoadingRecommended = true;
  reconmmended: IEgg[] = [];

  constructor(
    public route: ActivatedRoute,
    public titleService: TitleService,
    private eggsService: EggService
  ) {
    // Grab error code from the navigation params
    let navParamsErrorCode = this.route.snapshot.paramMap.get('error_code');
    if (!isNaN(Number(navParamsErrorCode)))
      this.error_code = Number(navParamsErrorCode);

    // Build the error message according to error code
    if (this.error_code == 404) {
      this.error_title = 'Page not found';
      this.error_message =
        "Our apologies. The page you're looking for \
                          is currently unavailable at the moment. \
                          Please check for any mispellings.";
    } else if (this.error_code == 403) {
      this.error_title = 'Not allowed to view resource';
      this.error_message =
        "Opps. You don't have enough privilages to access \
                          this page. Please log in to your account if not already.";
    } else if (this.error_code == 400 || this.error_code == 501) {
      this.error_title = 'Bad request.';
      this.error_message =
        'Opps. Bad request reached on our side, please make \
                          sure you used proper instructions.';
    }

    this.titleService.onTitleChange.next(this.error_title + ' — Hetchfund');
  }

  goBack(): void {
    window.history.back();
  }

  ngOnInit(): void {
    this.isLoadingRecommended = true;
    this.eggsService.getRecommended(24).then((reconmmended: IEgg[]) => {
      this.isLoadingRecommended = false;
      this.reconmmended = reconmmended;
    });
  }
}
