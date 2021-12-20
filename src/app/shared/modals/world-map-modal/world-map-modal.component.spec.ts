import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldMapModalComponent } from './world-map-modal.component';

describe('WorldMapModalComponent', () => {
  let component: WorldMapModalComponent;
  let fixture: ComponentFixture<WorldMapModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorldMapModalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorldMapModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
