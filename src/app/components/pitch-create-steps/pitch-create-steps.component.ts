import { Component, Input, OnInit } from '@angular/core';
import { IEgg } from 'src/app/interfaces/IEgg';
import { RouterService } from 'src/app/services/router.service';

@Component({
  selector: 'app-pitch-create-steps',
  templateUrl: './pitch-create-steps.component.html',
  styleUrls: ['./pitch-create-steps.component.scss'],
})
export class PitchCreateStepsComponent implements OnInit {
  @Input() step: number;
  @Input() saveMethod: any;
  @Input() binder: any;
  @Input() draftProgress: any;

  isCurrentStepRequired = false;
  isCurrentStepCompleted = false;
  maxSteps = 5;

  window = window;

  isBackAvailable = false;
  isForwardAvailable = false;

  constructor(private routerService: RouterService) {
    if (this.step !== 1) {
      this.isBackAvailable = true;
    } else {
      this.isBackAvailable = false;
    }

    if (this.step !== this.maxSteps) {
      if (!this.isCurrentStepRequired) {
        this.isForwardAvailable = true;
      } else {
        if (this.isCurrentStepCompleted) {
          this.isForwardAvailable = true;
        }
      }
    } else {
      this.isForwardAvailable = false;
    }
  }

  ngOnInit() {
    if (!this.saveMethod) {
      this.saveMethod = () => {
        return new Promise((resolve, _) => {
          resolve(null);
        });
      };
    }
  }

  navigateTo(path: string) {
    path += location.search;
    this.saveMethod
      .bind(this.binder)()
      .then(() => {
        this.routerService.route(path.split('/'));
      });
  }
}
