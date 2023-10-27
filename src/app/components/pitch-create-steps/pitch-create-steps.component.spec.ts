import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PitchCreateStepsComponent } from './pitch-create-steps.component';

describe('PitchCreateStepsComponent', () => {
  let component: PitchCreateStepsComponent;
  let fixture: ComponentFixture<PitchCreateStepsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PitchCreateStepsComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PitchCreateStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
