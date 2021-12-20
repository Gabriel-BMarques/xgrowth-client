import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectPrivacyComponent } from './select-privacy.component';

describe('SelectPrivacyComponent', () => {
  let component: SelectPrivacyComponent;
  let fixture: ComponentFixture<SelectPrivacyComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SelectPrivacyComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectPrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
