import { Component, OnInit } from '@angular/core';
import { TitleService } from 'src/app/services/title.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { nanoid } from 'nanoid';
import { ActivatedRoute } from '@angular/router';
import { EggService } from 'src/app/services/egg.service';
import { RouterService } from 'src/app/services/router.service';
import { CurrencyResolverService } from 'src/app/services/currency-resolver.service';

@Component({
  selector: 'app-create-milestones',
  templateUrl: './create-milestones.page.html',
  styleUrls: ['./create-milestones.page.scss'],
})
export class CreateMilestonesPage implements OnInit {
  milestones = [];

  currentEditingIndex: number = undefined;
  currentEditingIsReached: boolean = undefined;
  name = '';
  milestone_target = '';

  draft;
  draft_key: string;

  constructor(
    private titleService: TitleService,
    private toastService: ToastManagerService,
    private activatedRoute: ActivatedRoute,
    private eggService: EggService,
    private routerService: RouterService,
    public currencyService: CurrencyResolverService
  ) {}

  ngOnInit() {
    this.titleService.onTitleChange.next(
      'Pitch milestones | Create: Hetchfund'
    );

    this.activatedRoute.queryParamMap.subscribe((queryParamMap) => {
      this.draft_key = queryParamMap.get('draft_key');
      this.eggService
        .getSavedDraft(this.draft_key)
        .then((draft) => {
          this.draft = draft;
          this.milestones = this.draft.milestones || [];
        })
        .catch((e) => {
          this.toastService.show(
            'Something went wrong while loading your saved data.'
          );
        });
    });
  }

  addMilestone(milestoneName: string, milestoneTargetAmount: string): void {
    if (!milestoneName)
      return this.toastService.show('Milestone name is required.');

    this.milestones.push({
      id: nanoid(),
      name: milestoneName,
      target_amount: parseFloat(milestoneTargetAmount),
      is_reached: false,
      timestamp_reached: null,
    });

    // Reset fields.
    this.name = '';
    this.milestone_target = '';

    return this.toastService.show('Milestone added to record.');
  }

  deleteMilestone(milestoneId: string): void {
    const milestoneIndex = this.milestones.findIndex(
      (milestone) => milestone.id == milestoneId
    );

    if (milestoneIndex > -1) {
      this.milestones.splice(milestoneIndex, 1);
    }

    if (
      this.currentEditingIndex == milestoneIndex ||
      this.currentEditingIndex !== undefined
    ) {
      this.currentEditingIndex = undefined;
    }
  }

  editMilestone(milestoneId: string): void {
    this.currentEditingIndex = this.milestones.findIndex(
      (milestone) => milestone.id == milestoneId
    );

    this.name = this.milestones[this.currentEditingIndex].name;
    this.milestone_target =
      this.milestones[this.currentEditingIndex].target_amount;
  }

  saveEditChanges(): void {
    this.milestones[this.currentEditingIndex].name = this.name;
    this.milestones[this.currentEditingIndex].target_amount = parseFloat(
      this.milestone_target
    );

    // Reset the fields.
    this.name = '';
    this.milestone_target = '';

    this.currentEditingIndex = undefined;
  }

  saveGlobalChanges(isFromButton = false): Promise<any> {
    return this.eggService
      .saveDraftEdits({
        key: this.draft_key,
        milestones: this.milestones,
        draft_progress: {
          milestones: { required: false, value: this.milestones.length > 0 },
        },
      })
      .then(() => {
        if (isFromButton) {
          this.routerService.route(['pitches', 'create', 'documentation'], {
            draft_key: this.draft_key,
          });
        }
      });
  }
}
