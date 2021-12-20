import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalShowAllRatingsComponent } from './modal-show-all-ratings.component';

describe('ModalShowAllRatingsComponent', () => {
  let component: ModalShowAllRatingsComponent;
  let fixture: ComponentFixture<ModalShowAllRatingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalShowAllRatingsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShowAllRatingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
