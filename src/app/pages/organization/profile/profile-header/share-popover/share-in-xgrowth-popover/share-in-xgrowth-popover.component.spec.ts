import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareInXgrowthPopoverComponent } from './share-in-xgrowth-popover.component';

describe('ShareInXgrowthPopoverComponent', () => {
  let component: ShareInXgrowthPopoverComponent;
  let fixture: ComponentFixture<ShareInXgrowthPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShareInXgrowthPopoverComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareInXgrowthPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
