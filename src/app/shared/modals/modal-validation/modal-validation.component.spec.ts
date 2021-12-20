import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalValidationComponent } from './modal-validation.component';

describe('ModalValidationComponent', () => {
  let component: ModalValidationComponent;
  let fixture: ComponentFixture<ModalValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalValidationComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
