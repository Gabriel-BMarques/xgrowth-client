import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasonryPopOverComponent } from './masonry-pop-over.component';

describe('MasonryPopOverComponent', () => {
  let component: MasonryPopOverComponent;
  let fixture: ComponentFixture<MasonryPopOverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MasonryPopOverComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasonryPopOverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
