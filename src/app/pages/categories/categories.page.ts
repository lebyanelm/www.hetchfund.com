import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { IBackendResponse } from 'src/app/interfaces/IBackendResponse';
import { ICategories } from 'src/app/interfaces/ICategories';
import { LoaderService } from 'src/app/services/loader.service';
import { TitleService } from 'src/app/services/title.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {
  categories: ICategories;
  categoryKeys: string[];

  isLoading = false;
  isUnableToLoad = false;

  constructor(
    private titleService: TitleService,
    private loaderService: LoaderService
  ) {}
  ngOnInit() {
    this.titleService.onTitleChange.next('Browse categories | Hetchfund');
    this.getCategories();
  }

  getCategories() {
    this.isLoading = true;
    superagent
      .get([environment.farmhouse, 'categories'].join('/'))
      .end((_, response) => {
        this.isLoading = false;
        if (response.statusCode == 200) {
          this.categories = response.body.data;
          this.categoryKeys = Object.keys(this.categories);
          this.isUnableToLoad = false;
        } else {
          this.isUnableToLoad = true;
        }
      });
  }
}
