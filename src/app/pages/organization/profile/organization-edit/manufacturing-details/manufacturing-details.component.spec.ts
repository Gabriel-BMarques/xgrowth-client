import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturingDetailsComponent } from './manufacturing-details.component';

describe('ManufacturingDetailsComponent', () => {
  let component: ManufacturingDetailsComponent;
  let fixture: ComponentFixture<ManufacturingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManufacturingDetailsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManufacturingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
