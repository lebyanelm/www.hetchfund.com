import { Component, OnInit } from '@angular/core';
import { throws } from 'assert';
import { IEgg } from 'src/app/interfaces/IEgg';
import { EggService } from 'src/app/services/egg.service';
import { SessionService } from 'src/app/services/session.service';
import { TitleService } from 'src/app/services/title.service';

@Component({
  selector: 'app-view-history',
  templateUrl: './view-history.page.html',
  styleUrls: ['./view-history.page.scss'],
})
export class ViewHistoryPage implements OnInit {
  isLoading = false;
  isUnableToLoad = false;

  all_viewed: IEgg[] = [];
  all_viewed_ids: string[] = [];

  recently_viewed_id: string;
  recently_viewed: IEgg;

  // Pagination
  currentPage = 0;

  constructor(
    private titleService: TitleService,
    private sessionService: SessionService,
    private eggService: EggService
  ) {}

  ngOnInit() {
    this.titleService.onTitleChange.next('View history | Hetchfund');
    this.isLoading = true;
    this.sessionService.sessionDataSubject.subscribe(() => {
      this.isLoading = false;
      this.all_viewed_ids = this.groupRecentViews(
        this.sessionService?.data.recently_viewed,
        5
      );

      this.eggService
        .get(this.all_viewed_ids[this.currentPage], false, false)
        .then((eggs: IEgg[]) => {
          this.all_viewed = eggs;
          // Remove the recently viewed pitch from the list
          this.recently_viewed = this.all_viewed.pop();
        })
        .catch((e) => {
          this.isUnableToLoad = false;
        });
    });
  }

  groupRecentViews(array, groupSize) {
    if (groupSize >= array.length || groupSize <= 0) {
      return array;
    }
    return [array.slice(0, groupSize), array.slice(groupSize)];
  }
}
