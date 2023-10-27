import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IHetcher } from 'src/app/interfaces/IHetcher';
import { EggService } from 'src/app/services/egg.service';
import { RouterService } from 'src/app/services/router.service';
import { SessionService } from 'src/app/services/session.service';
import { TitleService } from 'src/app/services/title.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';

@Component({
  selector: 'app-create-curators',
  templateUrl: './create-curators.page.html',
  styleUrls: ['./create-curators.page.scss'],
})
export class CreateCuratorsPage implements OnInit {
  curatorSuggestions = [];
  isLoadingSuggestions = false;

  // Selected curators
  selectedCurators = [];

  draft_key;
  draft;

  constructor(
    private titleService: TitleService,
    private toastService: ToastManagerService,
    private eggService: EggService,
    private routerService: RouterService,
    private activatedRoute: ActivatedRoute,
    public sessionService: SessionService
  ) {
    this.titleService.onTitleChange.next('Pitch curators | Create: Hetchfund');
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe((queryParamMap) => {
      this.draft_key = queryParamMap.get('draft_key');

      if (this.draft_key) {
        this.eggService.getSavedDraft(this.draft_key).then((draft) => {
          this.draft = draft;

          // Add the primary curator in the selected items.
          this.getCurator(this.draft.curator).then((curator) => {
            const id = curator._id;
            delete curator._id;
            this.selectedCurators.push({ ...curator, id });
          });

          // Set the saved and recovered values.
          this.draft.other_curators.forEach((curatorId) => {
            this.getCurator(curatorId).then((curator) => {
              const existingIndex = this.selectedCurators.findIndex(
                (v) => v.id === curator._id
              );
              if (existingIndex === -1) {
                const id = curator._id;
                delete curator._id;
                this.selectedCurators.push({ ...curator, id });
              }
            });
          });
        });
      }
    });
  }

  getCurator(curatorId: string): Promise<IHetcher> {
    return new Promise((resolve, reject) => {
      superagent
        .get([environment.accounts, 'by_email', curatorId].join('/'))
        .end((_, response) => {
          if (response) {
            if (response.statusCode === 200) {
              resolve({
                _id: response.body.data._id,
                username: response.body.data.username,
                email_address: response.body.data.email_address,
                display_name: response.body.data.display_name,
                profile_image: response.body.data.profile_image,
              });
            } else {
              reject(response);
            }
          } else {
            reject(response);
          }
        });
    });
  }

  performSuggestionsSearch(suggestionKeyword) {
    this.isLoadingSuggestions = true;
    if (suggestionKeyword.length) {
      superagent
        .get(
          [
            environment.accounts,
            'search',
            suggestionKeyword.replace(/\s/g, '_'),
          ].join('/')
        )
        .end((_, response) => {
          this.isLoadingSuggestions = false;

          if (response) {
            if (response.statusCode === 200) {
              this.curatorSuggestions = response.body.data.results;
            }
          }
        });
    } else {
      this.curatorSuggestions = [];
    }
  }

  toggleSuggestionSelection(suggestionSelected, isFromSearch = false) {
    const existingSelection = this.selectedCurators.findIndex(
      (selection) => selection.id == suggestionSelected.id
    );
    if (existingSelection !== -1) {
      if (isFromSearch) {
        return this.toastService.show(
          'Curator has already been selected, check selected members section.'
        );
      }

      if (
        this.sessionService.data?.email_address ===
        suggestionSelected?.email_address
      ) {
        this.toastService.show(
          'Can not remove primary curator from this pitch.'
        );
      } else {
        this.selectedCurators.splice(existingSelection, 1);
        this.toastService.show('Curator selected has been removed.');
      }
    } else {
      this.curatorSuggestions = [];
      this.selectedCurators.push(suggestionSelected);
    }
  }

  saveChanges(isFromButton = false) {
    return new Promise((resolve, rejct) => {
      const curatorIds = [];
      this.selectedCurators.forEach((curator) => {
        if (curator.username !== this.sessionService.data?.username) {
          curatorIds.push(curator.email_address);
        }
      });

      this.eggService
        .saveDraftEdits({
          key: this.draft_key,
          other_curators: curatorIds,
          draft_progress: {
            curators: {
              required: false,
              value: curatorIds.length > 0,
            },
          },
        })
        .then((changes) => {
          if (isFromButton) {
            this.routerService.route(['pitches', 'create', 'milestones'], {
              draft_key: this.draft_key,
            });
          }
          resolve(changes);
        });
    });
  }
}
