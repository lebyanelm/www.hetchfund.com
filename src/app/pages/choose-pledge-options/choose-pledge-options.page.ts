import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IEgg } from 'src/app/interfaces/IEgg';
import { CurrencyResolverService } from 'src/app/services/currency-resolver.service';
import { EggService } from 'src/app/services/egg.service';
import { LoaderService } from 'src/app/services/loader.service';
import { TitleService } from 'src/app/services/title.service';
import { RouterService } from 'src/app/services/router.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';

@Component({
  selector: 'app-choose-pledge-options',
  templateUrl: './choose-pledge-options.page.html',
  styleUrls: ['./choose-pledge-options.page.scss'],
})
export class ChoosePledgeOptionsPage implements OnInit {
  selectedReward = null;
  customContribution = '0';

  // Company details
  data: IEgg;
  pitch_key: string;

  rewardOptions: any;

  constructor(
    private titleService: TitleService,
    public currencyService: CurrencyResolverService,
    private eggService: EggService,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private toastService: ToastManagerService,
    private routerService: RouterService
  ) {}

  ngOnInit(): void {
    this.titleService.onTitleChange.next('Choose a contribution | Hetchfund');
    const loaderIdx = this.loaderService.showLoader();
    this.activatedRoute.paramMap.subscribe((params) => {
      this.pitch_key = params.get('pitch_key');

      this.eggService
        .get(this.pitch_key)
        .then((data) => {
          this.loaderService.hideLoader(loaderIdx);
          this.data = data;
        })
        .catch((e) => {
          this.loaderService.hideLoader(loaderIdx);
          this.routerService.route(['errors', '500'], { queryParams: e });
        });

      this.eggService
        .getRewards(this.pitch_key)
        .then((rewards: any) => {
          this.rewardOptions = rewards;
          this.selectedReward = this.rewardOptions.reward_options[0].id;
          console.log(this.rewardOptions);
        })
        .catch((error) => this.toastService.show(error));
    });
  }

  selectReward(id: string): void {
    this.selectedReward = id;
  }

  choosePaymentMethod(): void {
    this.routerService.route(
      ['pitches', this.pitch_key, 'contribution', 'choose-method'],
      {
        id: this.selectedReward,
        custom: this.customContribution,
        name: this.data?.funding_purpose,
      }
    );
  }

  isInvalidInput(input: string | any): boolean {
    console.log(input, isNaN(parseFloat(input)));
    return isNaN(parseFloat(input));
  }

  toInteger(input: string): number {
    console.log(input, parseFloat(input));
    return parseFloat(input);
  }
}
