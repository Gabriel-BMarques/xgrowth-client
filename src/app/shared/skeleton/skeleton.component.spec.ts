import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
  let component: SkeletonComponent;
  let fixture: ComponentFixture<SkeletonComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        imports: [IonicModule.forRoot()],
        declarations: [SkeletonComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not be visible by default', () => {
    // Arrange
    const element = fixture.nativeElement;
    const div = element.querySelectorAll('div')[0];

    // Assert
    expect(div.getAttribute('hidden')).not.toBeNull();
  });
});
