import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IonTextarea } from '@ionic/angular';
import { ERROR_MESSAGES } from 'src/app/error_messages';
import { EggService } from 'src/app/services/egg.service';
import { TitleService } from 'src/app/services/title.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit, AfterViewInit {
  @ViewChild('SearchInput') searchInput: ElementRef<HTMLInputElement>;
  debounceTimeoutId;

  errorMessage: string;

  searchKey: string = '';
  searchResults = [];
  searchResultsPages = 1;
  currentPage = 1;
  totalResults = [];
  isLoadingResults = false;

  trendingSearches = [];

  constructor(
    private titleService: TitleService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private pitchService: EggService
  ) {
    this.titleService.onTitleChange.next('Search for campaigns — Hetchfund');
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      if (params.get('keyword')) {
        this.searchKey = params.get('keyword');
        this.search(this.searchKey);
      }
    });

    this.pitchService.getTrendingSearches().then((trendingSearches: any) => {
      this.trendingSearches = trendingSearches;
      console.log(this.trendingSearches);
    });
  }

  ngAfterViewInit(): void {
    this.searchInput.nativeElement.onkeyup = (event: any) => {
      // this.router.navigate(['search'], {
      //   queryParams: { keyword: event.target.value },
      // });

      if (this.debounceTimeoutId) {
        clearTimeout(this.debounceTimeoutId);
      }
      this.debounceTimeoutId = setTimeout(() => {
        this.search(event.target.value);
      }, 1000);
    };
  }

  search(search_keyword): void {
    // Sends out a search query to the farmhouse database.
    this.isLoadingResults = true;
    superagent
      .get(
        [
          environment.farmhouse,
          'search',
          [
            search_keyword.replace(/\s/g, '_'),
            '?page=' + this.currentPage,
          ].join(''),
        ].join('/')
      )
      .end((_, response) => {
        this.isLoadingResults = false;
        if (response) {
          if (response.statusCode === 200) {
            console.log(response.body);
            this.searchResults = response.body.data.results;
            this.searchResultsPages = response.body.data.available_pages;

            this.totalResults = [...Array(this.searchResultsPages).keys()];
          } else {
            this.errorMessage =
              response.body.data?.reason || ERROR_MESSAGES.UNEXPECTED_ERROR;
          }
        } else {
          this.errorMessage = ERROR_MESSAGES.NO_INTERNET;
        }
      });
  }
}
