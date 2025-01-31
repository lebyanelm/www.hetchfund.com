import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { CustomRichTextEditorComponent } from 'src/app/components/rich-text-editor/rich-text-editor.component';
import { ERROR_MESSAGES } from 'src/app/error_messages';
import { ISupportArticle } from 'src/app/interfaces/ISupportArticle';
import { LoaderService } from 'src/app/services/loader.service';
import { RouterService } from 'src/app/services/router.service';
import { SessionService } from 'src/app/services/session.service';
import { TitleService } from 'src/app/services/title.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';
import * as timeago from 'timeago.js'

@Component({
  selector: 'app-support-article',
  templateUrl: './support-article.page.html',
  styleUrls: ['./support-article.page.scss'],
})
export class SupportArticlePage implements OnInit, AfterViewInit {
  @ViewChild('ArticleHeader') articleHeaderElement: ElementRef<HTMLDivElement>;
  @ViewChild('ArticleCategory') articleCategoryElement: ElementRef<HTMLDivElement>;
  @ViewChild('RichTextEditor') richTextEditor: CustomRichTextEditorComponent;
  @ViewChild(IonModal) ionModal: IonModal;

  articleKey: string;
  article: ISupportArticle;
  isCreateNew: boolean = false;
  isEditorMode: boolean = false;

  relatedArticles: ISupportArticle[] = [];

  upvotes = 0;
  downvotes = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private toastService: ToastManagerService,
    private routerService: RouterService,
    private titleService: TitleService,
    public sessionService: SessionService,
    ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.articleKey = params.get("article_key");
    });

    this.activatedRoute.queryParamMap.subscribe((queryParams) => {
      this.isCreateNew = queryParams.get('create') === '1' ? true : false;
      this.isEditorMode = this.isCreateNew;
    });
  }

  ngAfterViewInit(): void {
    if (!this.isCreateNew) {
      this.getArticleData();
    } else {
      this.richTextEditor.setData({blocks: []}, this.isEditorMode);
      this.titleService.onTitleChange.next("New article | Hetchfund.com");
    }
  }
  getRelatedArticles(category: string) {
    const loaderIdx = this.loaderService.showLoader();
    superagent
      .get([environment.farmhouse, 'support', 'articles?category=' + category].join('/'))
      .set("Authorization", this.sessionService.sessionToken ? ['Bearer', this.sessionService.sessionToken].join(' ') : undefined)
      .end((_, response) => {
        this.loaderService.hideLoader(loaderIdx);
        if (response) {
          if (response.statusCode === 200) {
            this.relatedArticles = response.body.data;
          } else {
            this.toastService.show(response.body.reason || "Something went wrong while loading related articles.")
          }
        } else {
          this.toastService.show(ERROR_MESSAGES.NO_INTERNET);
        }
      });
  }

  createNewArticle() {
    const loaderIdx = this.loaderService.showLoader();
    this.richTextEditor.save().then((blocks) => {
      const article = {
        name: this.articleHeaderElement.nativeElement.innerText,
        data: blocks,
        category: this.articleCategoryElement.nativeElement.innerText
      }

      if (article.name.length && article.category.length) {
        superagent
          .post([environment.farmhouse, 'support', 'articles'].join('/'))
          .send(article)
          .set("Authorization", ['Bearer', this.sessionService.sessionToken].join(' '))
          .end((_, response) => {
            this.loaderService.hideLoader(loaderIdx);
            if (response) {
              if (response.statusCode === 200) {
                this.routerService.route(['support', 'article', encodeURIComponent(response.body?.data?.key)]);
              } else {
                this.toastService.show(response.body.reason || "Something went wrong, save your work before reloading.")
              }
            } else {
              this.toastService.show(ERROR_MESSAGES.NO_INTERNET);
            }
          })
      } else {
        this.loaderService.hideLoader(loaderIdx);
        if (!article.name.length && !article.category.length) {
          this.toastService.show("Name and category of the article are required.");
        } else if (!article.name.length) {
          this.toastService.show("Name of the article is required.");
        } else {
          this.toastService.show("Category of the article is required.");
        }
      }
    })
  }

  getArticleData() {
    const loaderIdx = this.loaderService.showLoader();
    superagent.get([environment.farmhouse, 'support', 'articles', this.articleKey].join('/'))
      .set("Authorization", this.sessionService.sessionToken ? ['Bearer', this.sessionService.sessionToken].join(' ') : undefined)
      .end((_, response) => {
        this.loaderService.hideLoader(loaderIdx);
        if (response) {
          if (response.status === 200) {
            this.article = response.body?.data;
            this.titleService.onTitleChange.next(this.article?.name + " | Hetchfund.com");

            // Calculations.
            this.calculateStatistics();
            this.getRelatedArticles(this.article.category.replace(" ", "_"));

            // Initialise both editor and viewer.
            this.richTextEditor.setData(this.article?.data, this.article?.is_admin);
            this.isEditorMode = this.article?.is_admin;
          }
        }
      });
  }
  calculateStatistics() {
    this.article.age = this.getArticleAge(this.article.last_modified.timestamp);
    this.upvotes = this.round(this.article?.upvotes/(this.article?.upvotes+this.article?.downvotes));
    this.downvotes = this.round(this.article?.downvotes/(this.article?.upvotes+this.article?.downvotes));
  }

  deleteArticle() {
    const loaderIdx = this.loaderService.showLoader();
    this.ionModal.onDidDismiss()
      .then((event) => {
        if (event?.data) {
          if (event?.data === true) {
            superagent
              .delete([environment.farmhouse, 'support', 'articles', this.article?.key].join('/'))
              .set("Authorization", ['Bearer', this.sessionService.sessionToken].join(' '))
              .end((_, response) => {
                this.loaderService.hideLoader(loaderIdx);
                if (response) {
                  if (response.statusCode === 200) {
                    this.toastService.show("Article deleted.");
                    setTimeout(() => this.routerService.route(['support']), 3000);
                  } else {
                    this.toastService.show(response.body.reason || ERROR_MESSAGES.UNEXPECTED_ERROR);
                  }
                } else {
                  this.toastService.show(ERROR_MESSAGES.UNEXPECTED_ERROR);
                }
              });
          } else {
            this.toastService.show("Deleting cancelled.");
          }
        } else {
          this.toastService.show("Malformed request received.");
        }
      });
    this.ionModal.present();
  }

  saveArticleChanges() {
    const loaderIdx = this.loaderService.showLoader();
    this.richTextEditor.save().then((blocks) => {
      const article = {
        name: this.articleHeaderElement.nativeElement.innerText,
        data: blocks,
        category: this.articleCategoryElement.nativeElement.innerText
      }

      superagent.patch([environment.farmhouse, 'support', 'articles', this.articleKey].join('/'))
        .set("Authorization", this.sessionService.sessionToken ? ['Bearer', this.sessionService.sessionToken].join(' ') : undefined)
        .send(article)
        .end((_, response) => {
          this.loaderService.hideLoader(loaderIdx);
          if (response) {
            if (response.statusCode === 200) {
              this.article = { ...this.article, ...response.body?.data };
              this.article = response.body?.data || this.article;
              this.calculateStatistics();
              
              this.toastService.show("Article changes succesfully made.");
            } else {
              this.toastService.show(response.body.reason || ERROR_MESSAGES.UNEXPECTED_ERROR);
            } 
          } else {
            this.toastService.show(ERROR_MESSAGES.NO_INTERNET);
          }
        });
    });
  }

  getArticleAge(timeCreated: number): string {
    const TO_UTC_TIMESTAMP = 1000;
    return timeago.format(
      new Date(timeCreated * TO_UTC_TIMESTAMP).getTime(),
      'en-ZA'
    );
  }

  toggleVisibility() {
    const loaderIdx = this.loaderService.showLoader();
    superagent.post([environment.farmhouse, 'support', 'articles', this.articleKey, 'visibility'].join('/'))
      .set("Authorization", this.sessionService.sessionToken ? ['Bearer', this.sessionService.sessionToken].join(' ') : undefined)
      .end((_, response) => {
          this.loaderService.hideLoader(loaderIdx);
          if (response) {
            if (response.statusCode === 200) {
              this.article.is_published = response.body?.data?.is_published;
              this.toastService.show("Article visibility changed to: " + (this.article.is_published === false ? "Private" : "Public"));
            } else {
              this.toastService.show(response.body.reason || ERROR_MESSAGES.UNEXPECTED_ERROR);
            }
          } else {
            this.toastService.show(ERROR_MESSAGES.NO_INTERNET);
          }
      });
  }

  upvote() {
    this.vote(true);
  }

  downvote() {
    this.vote(false);
  }

  vote(isUpvote: boolean = true) {
    const loaderIdx = this.loaderService.showLoader();
    superagent
      .post([environment.farmhouse, 'support', 'articles', this.article.key, 'votes', isUpvote ? 'upvote' : 'downvote'].join('/'))
      .set("Authorization", this.sessionService.sessionToken ? ["Bearer", this.sessionService.sessionToken].join(" ") : undefined)
      .end((_, response) => {
        this.loaderService.hideLoader(loaderIdx);
        if (response) {
          if (response.statusCode === 200) {
            this.article = response.body?.data || this.article;
            this.calculateStatistics();

            this.toastService.show("Thank you for your vote, we'll take it into consideration.");
          }
        } else {
          this.toastService.show(ERROR_MESSAGES.NO_INTERNET);
        }
      });
  }

  round(nd: any): number {
    console.log(nd)
    return (Math.round(nd * 100) / 100) * 100;
  }
}
