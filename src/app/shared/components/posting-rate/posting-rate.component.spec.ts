import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostingRateComponent } from './posting-rate.component';

describe('PostingRateComponent', () => {
  let component: PostingRateComponent;
  let fixture: ComponentFixture<PostingRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostingRateComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostingRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
