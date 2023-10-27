import { Component, OnInit } from '@angular/core';
import { TitleService } from 'src/app/services/title.service';

@Component({
  selector: 'app-support-portal',
  templateUrl: './support-portal.page.html',
  styleUrls: ['./support-portal.page.scss'],
})
export class SupportPortalPage implements OnInit {
  constructor(private titleService: TitleService) {}

  ngOnInit() {
    this.titleService.onTitleChange.next('Support | Hetchfund');
  }
}
