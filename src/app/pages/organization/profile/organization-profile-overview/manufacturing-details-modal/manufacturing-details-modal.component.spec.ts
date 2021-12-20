import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturingDetailsModalComponent } from './manufacturing-details-modal.component';

describe('ManufacturingDetailsModalComponent', () => {
  let component: ManufacturingDetailsModalComponent;
  let fixture: ComponentFixture<ManufacturingDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManufacturingDetailsModalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManufacturingDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
