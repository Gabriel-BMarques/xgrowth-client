import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CompanyCapabilitiesComponent } from './company-capabilities-1.component';

describe('CompanyCapabilitiesComponent', () => {
  let component: CompanyCapabilitiesComponent;
  let fixture: ComponentFixture<CompanyCapabilitiesComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CompanyCapabilitiesComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyCapabilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
