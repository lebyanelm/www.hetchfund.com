import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IContribution } from 'src/app/interfaces/IContribution';
import { SessionService } from 'src/app/services/session.service';
import { TitleService } from 'src/app/services/title.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import * as superagent from "superagent";

@Component({
  selector: 'app-contribution-details',
  templateUrl: './contribution-details.page.html',
  styleUrls: ['./contribution-details.page.scss'],
})
export class ContributionDetailsPage implements OnInit {
  contributionId: string;
  contribution: IContribution;
  responseStatus = 0;
  resonseMessage = "Something went wrong while getting the contribution.";
  
  constructor(private activatedRoute: ActivatedRoute,
              private toastService: ToastManagerService,
              public sessionService: SessionService,
              private titleService: TitleService) {}

  ngOnInit() {
    this.titleService.onTitleChange.next("Contribution | Hetchfund.com")
    
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      this.contributionId = paramMap.get("contribution_id")
      superagent.get([environment.farmhouse, 'pitches', 'contributions', this.contributionId].join("/"))
                .set("Authorization", ["Bearer", this.sessionService.sessionToken].join(" "))
                .end((_, response) => {
                  // Check errors.
                  if (_) {
                    return this.toastService.show(_, true, true);
                  }
                  
                  if (response.status) {
                    this.contribution = response.body.data;
                    console.log(this.contribution)
                  }
                });
    });
  }

  requestReceiptPrintOut(): void {
    return print();
  }
}
