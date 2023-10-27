import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RecentlyViewedEggComponent } from './recently-viewed-egg.component';

describe('RecentlyViewedEggComponent', () => {
  let component: RecentlyViewedEggComponent;
  let fixture: ComponentFixture<RecentlyViewedEggComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecentlyViewedEggComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RecentlyViewedEggComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
