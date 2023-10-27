import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IEgg } from 'src/app/interfaces/IEgg';
import { CurrencyResolverService } from 'src/app/services/currency-resolver.service';
import { EggService } from 'src/app/services/egg.service';
import { RouterService } from 'src/app/services/router.service';
import { TitleService } from 'src/app/services/title.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';

@Component({
  selector: 'app-create-contributions',
  templateUrl: './create-contributions.page.html',
  styleUrls: ['./create-contributions.page.scss'],
})
export class CreateContributionsPage implements OnInit {
  hetchingGoal: number; // Maximum amount of funds required for this pitch.
  pitchPeriod: number = 2; // How long this pitch intends to be active to the public.

  draft_key: string;
  draft: IEgg;

  finances: any = {
    design_and_prototype: { amount: '', date_fulfilled: undefined },
    regulatory_compliance: { amount: '', date_fulfilled: undefined },
    development: { amount: '', date_fulfilled: undefined },
    testing: { amount: '', date_fulfilled: undefined },
    professional_fees: { amount: '', date_fulfilled: undefined },
    final_development: { amount: '', date_fulfilled: undefined },
    reward_fulfillment: { amount: '', date_fulfilled: undefined },
  };

  constructor(
    public currencyService: CurrencyResolverService,
    private eggService: EggService,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastManagerService,
    private routerService: RouterService,
    private titleService: TitleService
  ) {
    this.titleService.onTitleChange.next('Pitch finances | Create: Hetchfund');

    this.activatedRoute.queryParamMap.subscribe((queryParamMap) => {
      this.draft_key = queryParamMap.get('draft_key');
      if (this.draft_key) {
        this.eggService.getSavedDraft(this.draft_key).then((draft: IEgg) => {
          this.draft = draft;

          this.finances = this.draft.finances;
          console.log(this.finances);

          // Set the saved and recovered values.
          this.hetchingGoal = this.draft?.hetching_goal || 0;
          this.pitchPeriod = this.draft?.pitch_period || 2;
        });
      }
    });
  }

  ngOnInit() {}

  acceptDigits(
    input: HTMLTextAreaElement | HTMLSelectElement,
    fieldName: string
  ) {
    const invalidChars = /[^0-9]/gi;
    if (invalidChars.test(input.value)) {
      input.value = input.value.replace(invalidChars, '');
    } else {
      this[fieldName] = parseFloat(input.value) || 0;
      console.log({
        hetchingGoal: this.hetchingGoal,
        pitchPeriod: this.pitchPeriod,
      });
    }
  }

  saveContributions() {
    // Calculate the ending timestamp of the pitch period.
    const today = new Date(),
      pitchEndingTimestamp =
        today.setMonth(today.getMonth() + this.pitchPeriod) / 1000;

    // Save the edits.
    return this.eggService
      .saveDraftEdits({
        key: this.draft_key,
        hetching_goal: this.getTotalCosts() || 0,
        finances: this.finances,
        ending_timestamp: pitchEndingTimestamp || null,
        pitch_period: this.pitchPeriod || null,
      })
      .then(() => {
        this.routerService.route(['pitches', 'create', 'rewards'], {
          draft_key: this.draft_key,
        });
      })
      .catch(() =>
        this.toastService.show(
          'Something went wrong while saving your data, please try again.'
        )
      );
  }

  getTotalCosts() {
    return (
      parseFloat(this.finances.design_and_prototype.amount || '0') +
      parseFloat(this.finances.regulatory_compliance.amount || '0') +
      parseFloat(this.finances.development.amount || '0') +
      parseFloat(this.finances.testing.amount || '0') +
      parseFloat(this.finances.professional_fees.amount || '0') +
      parseFloat(this.finances.final_development.amount || '0') +
      parseFloat(this.finances.reward_fulfullment.amount || '0')
    );
  }
}
