import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddMembersComponent } from './add-members.component';

describe('AddMembersComponent', () => {
  let component: AddMembersComponent;
  let fixture: ComponentFixture<AddMembersComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AddMembersComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
