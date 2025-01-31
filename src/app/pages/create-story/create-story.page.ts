import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomRichTextEditorComponent } from 'src/app/components/rich-text-editor/rich-text-editor.component';
import { IEgg } from 'src/app/interfaces/IEgg';
import { EggService } from 'src/app/services/egg.service';
import { RouterService } from 'src/app/services/router.service';

import { SessionService } from 'src/app/services/session.service';
import { TitleService } from 'src/app/services/title.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';

@Component({
  selector: 'app-create-story',
  templateUrl: './create-story.page.html',
  styleUrls: ['./create-story.page.scss'],
})
export class CreateStoryPage implements OnInit {
  @ViewChild('TextEditor') textEditor: CustomRichTextEditorComponent;
  draft_key: string;
  draft: IEgg;
  islivepitch = false;

  constructor(
    private sessionService: SessionService,
    private eggService: EggService,
    private activatedRoute: ActivatedRoute,
    private routerService: RouterService,
    private toastService: ToastManagerService,
    private titleService: TitleService
  ) {
    this.titleService.onTitleChange.next('Pitch story | Create: Basics - Hetchfund.com');

    this.activatedRoute.queryParamMap.subscribe((queryParamMap) => {
      this.draft_key = queryParamMap.get('draft_key') || queryParamMap.get('pitch_key');
      this.islivepitch = queryParamMap.get('islive') === '1' ? true : false;

      this.eggService.get(this.draft_key, { isDraft: !this.islivepitch, enableInterest: false, enableRecent: false })
        .then((data) => {
          this.draft = data;
          this.textEditor.setData(this.draft.story, true);
        })
    });
  }

  ngOnInit() {}

  save(isFromSaveButton = false) {
    return this.textEditor.save().then((storyData: any) => {
      this.eggService
        .saveDraftEdits({
          key: this.draft_key,
          story: storyData,
          draft_progress: {
            story: { required: true, value: storyData.blocks.length > 0 },
          },
        })
        .then(() => {
          if (isFromSaveButton) {
            this.routerService.route(['pitches', 'create', 'finances'], {
              draft_key: this.draft.key,
            });
          }
        })
        .catch((statusCode) => {
          if (statusCode == 500) {
            this.toastService.show(
              'A system error occured while trying to save the data, please try again.'
            );
          } else {
            this.toastService.show(
              "Something we don't understand has occured, please try again."
            );
          }
        });
    });
  }

  isStoryCompleted() {
    //this.
  }
}
