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

  finances: any;
  finance_categories_details = {
    research_and_development: { name: "R&D (Research and Development)", description: "Cost incured to perfom research for manufacturing your project.", required: true },
    regulatory_compliance: { name: "Regulatory compliance", description: "Cost incured to be registered with proper regulatory bodies, eg. patent or company registrations.", required: true },
    manufacturing: { name: "Manufacturing", description: "Cost incured to produce the actual products/outcomes of your project.", required: true },
    packaging: { name: "Packaging", description: "Cost incured to package your manufactured outcomes for branding and shipping to funders.", required: true },
    shipping: { name: "Shipping", description: "Cost incured to ship packaged outcomes of your project to funders.", required: true },
    tax: { name: "Tax", description: "Tax amount to the total above costs incured.", required: true },
    labor: { name: "Shipping", description: "Cost incured to people / employees helping produce the project's outcomes.", required: false },
    miscellaneous: { name: "Miscellaneous", description: "Costs that can not be categorised in the above fields.", required: false },
  }
  finance_categories_list = [
    "research_and_development",
    "regulatory_compliance",
    "manufacturing",
    "packaging",
    "shipping",
    "labor",
    "miscellaneous",
  ]

  constructor(
    public currencyService: CurrencyResolverService,
    private eggService: EggService,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastManagerService,
    private routerService: RouterService,
    private titleService: TitleService
  ) {
    this.titleService.onTitleChange.next('New pitch | Create: Finances - Hetchfund.com');
    
    this.finances = {
      research_and_development: { amount: '', last_updated: undefined, status: "funding" },
      regulatory_compliance: { amount: '', last_updated: undefined, status: "funding" },
      manufacturing: { amount: '', last_updated: undefined, status: "funding" },
      packaging: { amount: '', last_updated: undefined, status: "funding" },
      shipping: { amount: '', last_updated: undefined, status: "funding" },
      labor: { amount: '', last_updated: undefined, status: "funding" },
      miscellaneous: { amount: '', last_updated: undefined, status: "funding" },
    };

    this.activatedRoute.queryParamMap.subscribe((queryParamMap) => {
      this.draft_key = queryParamMap.get('draft_key');
      if (this.draft_key) {
        this.eggService.getSavedDraft(this.draft_key).then((draft: IEgg) => {
          this.draft = draft;
          this.finances = this.draft.finances;

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
      parseFloat(this.finances?.design_and_prototype?.amount || '0') +
      parseFloat(this.finances?.regulatory_compliance?.amount || '0') +
      parseFloat(this.finances?.development?.amount || '0') +
      parseFloat(this.finances?.testing?.amount || '0') +
      parseFloat(this.finances?.professional_fees?.amount || '0') +
      parseFloat(this.finances?.final_development?.amount || '0') +
      parseFloat(this.finances?.reward_fulfillment?.amount || '0')
    );
  }
}
