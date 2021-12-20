import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReferSolverPopoverComponent } from './refer-solver-popover.component';

describe('ReferSolverPopoverComponent', () => {
  let component: ReferSolverPopoverComponent;
  let fixture: ComponentFixture<ReferSolverPopoverComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ReferSolverPopoverComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferSolverPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
