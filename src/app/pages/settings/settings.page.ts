import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import { SessionService } from 'src/app/services/session.service';
import { TitleService } from 'src/app/services/title.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  activeTab = 'security';
  tabs = [
    'security',
    'account_activity',
    'notifications',
    'devices_management',
    'privacy',
    'contribution',
  ];

  account_activity = [
    {
      key: '1',
      type: 'Login Attempt',
      device_name: 'Android',
      device_details:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
      ip_address: '192.168.8.100',
      location: 'Gauteng, Johannesburg',
    },
    {
      key: '2',
      type: 'Contribution Transaction',
      device_name: 'Linux',
      device_details:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
      ip_address: '192.168.8.100',
      location: 'Gauteng, Pretoria',
    },
  ];
  selectedAccountActivities = [];
  
  isShowIPAddresses = false;

  constructor(
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    public sessionService: SessionService
  ) {
    this.activatedRoute.paramMap.subscribe((params) => {
      if (this.tabs.includes(params.get('settings_category'))) {
        this.activeTab = params.get('settings_category');
      }
    });
  }

  ngOnInit() {
    this.titleService.onTitleChange.next('Settings | Hetchfund');
  }

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  updateSettingValue(
    preferenceName: string,
    preferenceInput: HTMLInputElement
  ): Promise<any> {
    const loaderIdx = this.loaderService.showLoader();
    return new Promise(() => {
      superagent
        .post([environment.accounts, 'preference'].join('/'))
        .send({
          preference_name: preferenceName,
          preference_value:
            preferenceInput.type == 'checkbox'
              ? preferenceInput.checked
              : preferenceInput.value,
        })
        .set(
          'Authorization',
          ['Bearer', this.sessionService.sessionToken].join(' ')
        )
        .end((_, response) => {
          this.loaderService.hideLoader(loaderIdx);
          if (response) {
            if (response.statusCode === 200) {
              console.log('Preference updated.');
            } else {
              console.log(response.body.reason || 'Something went wrong.');
            }
          }
        });
    });
  }

  deleteAccountActivity(keys: string[]): void {
    const delectedActivies = [];
    for (const key of keys) {
      const accountActivityIndex = this.account_activity.findIndex((activity) => activity.key === key);
      if (accountActivityIndex !== -1) {
        this.account_activity.splice(accountActivityIndex, 1);
        delectedActivies.push(key);
      } 
    }

    // Send this update to the server for processing.
    console.log(delectedActivies);
  }

  selectAccountActivity(key: string): void {
    if (this.selectedAccountActivities.includes(key)) {
      const activityIndex = this.selectedAccountActivities.findIndex(activityKey => activityKey === key);
      this.selectedAccountActivities.splice(activityIndex, 1);
    } else {
      this.selectedAccountActivities.push(key);
    }
  }
}
