import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BriefInactiveComponent } from './brief-inactive.component';

describe('BriefInactiveComponent', () => {
  let component: BriefInactiveComponent;
  let fixture: ComponentFixture<BriefInactiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BriefInactiveComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BriefInactiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
