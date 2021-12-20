import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CompanyCapabilities2Component } from './company-capabilities-2.component';

describe('CompanyCapabilities2Component', () => {
  let component: CompanyCapabilities2Component;
  let fixture: ComponentFixture<CompanyCapabilities2Component>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CompanyCapabilities2Component]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyCapabilities2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
