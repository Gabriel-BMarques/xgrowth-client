import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BriefEmptyComponent } from './brief-empty.component';

describe('BriefEmptyComponent', () => {
  let component: BriefEmptyComponent;
  let fixture: ComponentFixture<BriefEmptyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BriefEmptyComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BriefEmptyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
