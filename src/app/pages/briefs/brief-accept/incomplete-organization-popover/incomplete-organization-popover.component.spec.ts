import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncompleteOrganizationPopoverComponent } from './incomplete-organization-popover.component';

describe('IncompleteOrganizationPopoverComponent', () => {
  let component: IncompleteOrganizationPopoverComponent;
  let fixture: ComponentFixture<IncompleteOrganizationPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IncompleteOrganizationPopoverComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncompleteOrganizationPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
