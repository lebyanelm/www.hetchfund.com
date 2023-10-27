import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-hetchers-list',
  templateUrl: './hetchers-list.component.html',
  styleUrls: ['./hetchers-list.component.scss'],
})
export class HetchersListComponent implements OnInit {
  @Input() title: string;
  @Input() fourGridFormat: boolean = false;
  @Input() isLoading: boolean;

  @Input() hetchers: {
    data: {
      display_name: string;
      profile_image: string;
      username: string;
    }[];
    isLoading: boolean;
  } = {
    data: [],
    isLoading: true,
  };

  constructor() {}
  ngOnInit() {}
}
