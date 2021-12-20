import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolverLoopComponent } from './solver-loop.component';

describe('SolverLoopComponent', () => {
  let component: SolverLoopComponent;
  let fixture: ComponentFixture<SolverLoopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SolverLoopComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SolverLoopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
