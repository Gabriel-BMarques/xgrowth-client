import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CollectionModalComponent } from './collection-modal.component';

describe('CollectionModalComponent', () => {
  let component: CollectionModalComponent;
  let fixture: ComponentFixture<CollectionModalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CollectionModalComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
