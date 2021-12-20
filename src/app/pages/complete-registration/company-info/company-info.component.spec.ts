import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CompanyInfoComponent } from './company-info.component';

describe('CompanyInfoComponent', () => {
  let component: CompanyInfoComponent;
  let fixture: ComponentFixture<CompanyInfoComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CompanyInfoComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
