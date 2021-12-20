import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopoverLeaveOrganizationComponent } from './popover-leave-organization.component';

describe('PopoverLeaveOrganizationComponent', () => {
  let component: PopoverLeaveOrganizationComponent;
  let fixture: ComponentFixture<PopoverLeaveOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PopoverLeaveOrganizationComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopoverLeaveOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
