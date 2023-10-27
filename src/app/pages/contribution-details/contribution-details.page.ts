import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contribution-details',
  templateUrl: './contribution-details.page.html',
  styleUrls: ['./contribution-details.page.scss'],
})
export class ContributionDetailsPage implements OnInit {
  constructor() {}

  ngOnInit() {}

  requestReceiptPrintOut(): void {
    return print();
  }
}
