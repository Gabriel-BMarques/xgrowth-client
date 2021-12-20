import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestsCompletePopoverComponent } from './interests-complete-popover.component';

describe('InterestsCompletePopoverComponent', () => {
  let component: InterestsCompletePopoverComponent;
  let fixture: ComponentFixture<InterestsCompletePopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InterestsCompletePopoverComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterestsCompletePopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
