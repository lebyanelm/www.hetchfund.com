import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IEgg } from 'src/app/interfaces/IEgg';
import { EggService } from 'src/app/services/egg.service';
import { TitleService } from 'src/app/services/title.service';

@Component({
  selector: 'app-selected-category',
  templateUrl: './selected-category.page.html',
  styleUrls: ['./selected-category.page.scss'],
})
export class SelectedCategoryPage implements OnInit {
  selectedCategory: string = '';
  page = 1;
  pitches: IEgg[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private pitchService: EggService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.selectedCategory = params.get('category_name');

      if (this.selectedCategory) {
        this.pitchService
          .getRelated(this.selectedCategory, this.page)
          .then((pitches: IEgg[]) => {
            this.pitches = pitches;
          });
      }

      this.titleService.onTitleChange.next(
        this.selectedCategory + ' — Hetchfund'
      );
    });
  }

  goBack() {
    window.history.back();
  }
}
