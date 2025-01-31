import { Component, Input, OnInit } from '@angular/core';
import { IEgg } from 'src/app/interfaces/IEgg';
import { IHetcher } from 'src/app/interfaces/IHetcher';
import { CurrencyResolverService } from 'src/app/services/currency-resolver.service';
import { EggService } from 'src/app/services/egg.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-egg',
  templateUrl: './egg.component.html',
  styleUrls: ['./egg.component.scss'],
})
export class EggComponent implements OnInit {
  @Input('data') data: IEgg;
  @Input('ref') ref: string;
  @Input('tab') tab: string;
  @Input('binder') binder: any;
  @Input('color_style') colorStyle: string;
  @Input('is_draft') is_draft: boolean = false;
  @Input('embedded') embedded: boolean = false;

  isbookmarked = false;
  sessionData: IHetcher;
  curator: IHetcher;

  constructor(
    public currencyResolver: CurrencyResolverService,
    public sessionService: SessionService,
    private eggService: EggService
  ) {}

  ngOnInit() {
    this.isbookmarked = this.data?.bookmarks?.includes(
      this.sessionService.data?.email_address
    );
    console.log(this.data)

    this.eggService.getCurator(this.data?.curator)
      .then((curator: IHetcher) => {
        this.curator = {display_name: curator.display_name, profile_image: curator.profile_image, email_address: curator.email_address};
        console.log(this.curator)
      }).catch((error) => console.error(error))
  }

  toLocaleString(number: number): string {
    return number.toLocaleString();
  }

  bookmark() {
    this.eggService.bookmark(this.data.key).then((responseData: IEgg) => {
      this.data = responseData;
      this.isbookmarked = this.data?.bookmarks?.includes(
        this.sessionService.data?.email_address
      );
    });
  }

  truncate(input) {
    const MAX_LENGTH = 125;

    if (input.length > MAX_LENGTH) {
      return input.substring(0, MAX_LENGTH) + '...';
    }

    return input;
  }

  deleteDraft(draftKey: string): void {
    this.eggService.deleteDraft(draftKey).then(() => {
      console.log("Deleted");
      if (this.binder) {
        const draftIndex = this.binder.findIndex((draft) => draft.key === draftKey);
        if (draftIndex > -1) {
          const field = [this.tab, 'pitches'].join('_');
          this.binder[field].splice(draftIndex, 1);
        }
      }
    });
  }

  endPitch(draftKey): void {

  }
}
