import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ISupportArticle } from 'src/app/interfaces/ISupportArticle';
import { LoaderService } from 'src/app/services/loader.service';
import { SessionService } from 'src/app/services/session.service';
import { TitleService } from 'src/app/services/title.service';
import { environment } from 'src/environments/environment';
import { SupportArticlePage } from '../support-article/support-article.page';
import * as superagent from 'superagent';
import * as timeago from 'timeago.js';
import { RouterService } from 'src/app/services/router.service';
import { ActivatedRoute } from '@angular/router';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { ERROR_MESSAGES } from 'src/app/error_messages';


@Component({
  selector: 'app-support-portal',
  templateUrl: './support-portal.page.html',
  styleUrls: ['./support-portal.page.scss'],
})
export class SupportPortalPage implements AfterViewInit {
  @ViewChild("SearchInput") searchInput: ElementRef<HTMLInputElement>;
  
  articles: ISupportArticle[] = [];

  // Searching articles.
  searchResultsPage: string = "1";
  searchKeyword: string = "";
  availabeleTotalResults: number = 0;
  
  constructor(private titleService: TitleService,
              private sessionService: SessionService,
              private loaderService: LoaderService,
              private activatedRoute: ActivatedRoute,
              private routerService: RouterService,
              private toastService: ToastManagerService) {}

  ngAfterViewInit() {
    this.titleService.onTitleChange.next('Support portal | Hetchfund');

    // Load query params.
    this.activatedRoute.queryParamMap.subscribe((queryParams) => {
      this.searchKeyword = queryParams.get("search");
      this.searchResultsPage = queryParams.get("page");

      // Check for search filters first.
      if (this.searchKeyword) {
        this.searchInput.nativeElement.value = this.searchKeyword;
        const loaderIdx = this.loaderService.showLoader();
        
        // Get the search results.
        superagent
          .get([environment.farmhouse, 'support', 'articles', 'search', this.searchKeyword].join('/'))
          .query({page: this.searchResultsPage})
          .end((_, response) => {
            this.loaderService.hideLoader(loaderIdx);
            
            if (response) {
              if (response.statusCode === 200) {
                this.articles = response.body.data?.results;
                this.availabeleTotalResults = response.body?.data?.available_total_results;
                for (let index = 0; index <= this.articles.length-1; index++) {
                  this.articles[index].age = this.getArticleAge(this.articles[index]?.last_modified?.timestamp)
                }
              } else {
                this.toastService.show(response.body.reason || ERROR_MESSAGES.UNEXPECTED_ERROR);
              }
            } else {
              this.toastService.show(ERROR_MESSAGES.NO_INTERNET);
            }
          });
      } else {
        // When no filter is active.
        this.getAllArticles();
      }
    });
  }

  getAllArticles() {
    const loaderIdx = this.loaderService.showLoader();
    superagent
      .get([environment.farmhouse, 'support', 'articles'].join('/'))
      .set("Authorization", this.sessionService.sessionToken ? ['Bearer', this.sessionService.sessionToken].join(' ') : undefined)
      .end((_, response) => {
        this.loaderService.hideLoader(loaderIdx);
        if (response) {
          if (response.status === 200) {
            this.articles = response.body.data;
            for (let index = 0; index <= this.articles.length-1; index++) {
              this.articles[index].age = this.getArticleAge(this.articles[index]?.last_modified?.timestamp)
            }
          }
        }
      })
  }

  getArticleAge(timeCreated: number): string {
    return SupportArticlePage.prototype.getArticleAge(timeCreated);
  }

  // Searching articles.
  search(keyword: string) {
    if (keyword) {
      this.searchResultsPage = "1";
      this.routerService.route(['support?search=' + encodeURIComponent(keyword) + '&page=' + this.searchResultsPage]);
    }
  }
}
