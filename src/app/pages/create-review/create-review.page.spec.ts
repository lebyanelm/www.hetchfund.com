import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateReviewPage } from './create-review.page';

describe('CreateReviewPage', () => {
  let component: CreateReviewPage;
  let fixture: ComponentFixture<CreateReviewPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CreateReviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
