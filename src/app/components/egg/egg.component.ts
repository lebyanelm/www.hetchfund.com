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
  @Input('color_style') colorStyle: string;
  @Input('embedded') embedded: boolean = false;

  isbookmarked = false;
  sessionData: IHetcher;

  constructor(
    public currencyResolver: CurrencyResolverService,
    public sessionService: SessionService,
    private eggService: EggService
  ) {}

  ngOnInit() {
    // this.sessionService.sessionData.
    this.isbookmarked = this.data?.bookmarks?.includes(
      this.sessionService.data?.email_address
    );
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
}
