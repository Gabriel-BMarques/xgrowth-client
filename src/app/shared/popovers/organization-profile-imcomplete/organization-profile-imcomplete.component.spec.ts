import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationProfileImcompleteComponent } from './organization-profile-imcomplete.component';

describe('OrganizationProfileImcompleteComponent', () => {
  let component: OrganizationProfileImcompleteComponent;
  let fixture: ComponentFixture<OrganizationProfileImcompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrganizationProfileImcompleteComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationProfileImcompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
