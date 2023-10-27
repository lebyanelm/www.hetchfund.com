import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IHetcher } from 'src/app/interfaces/IHetcher';
import { SessionService } from 'src/app/services/session.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import { ERROR_MESSAGES } from 'src/app/error_messages';
import * as superagent from 'superagent';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit, AfterViewInit {
  @Input() passedData: IHetcher;

  @ViewChild('DisplayNameField') displayNameField: ElementRef<HTMLInputElement>;
  @ViewChild('BiographyField') biographyField: ElementRef<HTMLInputElement>;
  @ViewChild('NationalitySelect')
  nationalitySelect: ElementRef<HTMLSelectElement>;
  @ViewChild('HomeCitySelect') homeCitySelect: ElementRef<HTMLSelectElement>;
  @ViewChild('OccupationSelect')
  occupationSelect: ElementRef<HTMLSelectElement>;
  @ViewChild('IsCollectiveProfile')
  isCollectiveProfleCheckbox: ElementRef<HTMLInputElement>;
  @ViewChild('GenderSelect')
  genderSelect: ElementRef<HTMLSelectElement>;
  @ViewChild('AgeField')
  ageField: ElementRef<HTMLInputElement>;

  isLoadingNationalities = false;
  nationalities = [];
  selectedNationality: string;

  isLoadingCities = false;
  cities = [];
  selectedCity: string;

  isLoadingOccupations = false;
  occupations = [];
  selectedOccupation: string;

  selectedGender: string;

  isSavingChanges = false;
  isDataChecked = false;

  constructor(
    private sessionService: SessionService,
    private toastService: ToastManagerService,
    private modalCtrl: ModalController
  ) {}

  getNationalities() {
    return new Promise((resolve) => {
      this.isLoadingNationalities = true;
      superagent
        .get([environment.accounts, 'nationalities'].join('/'))
        .end((_, response) => {
          this.isLoadingNationalities = false;
          if (response && response.statusCode == 200) {
            this.nationalities = response.body.data;
            resolve(null);
            this.selectNationality(
              this.passedData?.nationality || this.nationalities[0]
            );
          } else {
            this.nationalities = [];
          }
        });
    });
  }

  selectNationality(nationality: string) {
    this.selectedNationality = nationality;
    this.getCities();
  }

  getCities() {
    return new Promise((resolve) => {
      this.isLoadingCities = true;
      superagent
        .get(
          [
            environment.accounts,
            'nationalities',
            // Replace the spaces in the nationality name with _
            this.selectedNationality.replace(/\s/g, '_'),
            'cities',
          ].join('/')
        )
        .end((_, response) => {
          this.isLoadingCities = false;
          if (response && response.statusCode == 200) {
            this.cities = response.body.data;
            resolve(null);
            this.selectCity(this.passedData?.home_city || this.cities[0]);
          } else {
            this.cities = [];
          }
        });
    });
  }

  selectCity(city: string) {
    this.selectedCity = city;
  }

  getOccupations() {
    return new Promise((resolve) => {
      this.isLoadingOccupations = true;
      superagent
        .get([environment.accounts, 'occupations'].join('/'))
        .end((_, response) => {
          this.isLoadingOccupations = false;
          if (response && response.statusCode == 200) {
            this.occupations = response.body.data;
            resolve(null);
          } else {
            this.occupations = [];
          }
        });
    });
  }

  selectOccupation(occupation: string) {
    this.selectedOccupation = occupation;
  }

  selectGender(gender) {
    this.selectedGender = gender;
  }

  resetToDefault() {
    this.displayNameField.nativeElement.value = this.passedData.display_name;
    this.biographyField.nativeElement.value = this.passedData.biography;

    this.nationalitySelect.nativeElement.value = this.passedData.nationality;
    if (!this.passedData.nationality && this.nationalities.length) {
      this.nationalitySelect.nativeElement.value = this.nationalities[0];
      this.selectNationality(this.nationalities[0]);
    }

    this.homeCitySelect.nativeElement.value = this.passedData.home_city;
    if (!this.passedData.home_city && this.cities.length) {
      this.homeCitySelect.nativeElement.value = this.cities[0];
      this.selectCity(this.cities[0]);
    }

    this.occupationSelect.nativeElement.value = this.passedData.occupation;
    if (!this.passedData.occupation && this.occupations.length) {
      this.occupationSelect.nativeElement.value = this.occupations[0];
      this.selectOccupation(this.occupations[0]);
    }
  }

  saveChangesAndClose() {
    this.isSavingChanges = true;

    // Collect and prepare the available fields values
    const changes: IHetcher = {
      display_name: this.displayNameField.nativeElement.value,
      biography: this.biographyField.nativeElement.value,
      nationality: this.nationalitySelect.nativeElement.value,
      home_city: this.homeCitySelect.nativeElement.value,
      occupation: this.occupationSelect.nativeElement.value,
      is_collective: this.isCollectiveProfleCheckbox.nativeElement.checked,
      age: this.ageField.nativeElement.value,
      gender: this.genderSelect.nativeElement.value,
    };

    // Send the changes to be saved in the backend
    superagent
      .patch(
        [environment.accounts, this.passedData.username, 'update'].join('/')
      )
      .send(changes)
      .set(
        'Authorization',
        ['Bearer', this.sessionService.sessionToken].join(' ')
      )
      .end((_, response) => {
        this.isSavingChanges = false;
        if (response) {
          if (response && response.statusCode == 200) {
            this.toastService.show('Hetcher profile changes have been made.');
            this.modalCtrl.dismiss({
              ...this.passedData,
              ...response.body.data,
            });
          } else {
            this.toastService.show(
              response.body.reason || ERROR_MESSAGES.UNEXPECTED_ERROR
            );
          }
        } else {
          this.toastService.show(ERROR_MESSAGES.NO_INTERNET);
        }
      });
  }

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.getNationalities();
    this.getOccupations().then(() => {
      this.resetToDefault();
      this.isDataChecked = true;
    });
  }
}
