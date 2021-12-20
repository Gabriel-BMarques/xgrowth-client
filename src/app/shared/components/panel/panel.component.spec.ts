import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { PanelComponent } from './panel.component';

describe('PanelComponent', () => {
  let component: PanelComponent;
  let fixture: ComponentFixture<PanelComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        imports: [IonicModule.forRoot()],
        declarations: [PanelComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelComponent);
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

  it('should be visible when app is loading', () => {
    // Arrange
    const element = fixture.nativeElement;
    const div = element.querySelectorAll('div')[0];

    // Act
    fixture.componentInstance.isLoading = true;
    fixture.detectChanges();

    // Assert
    expect(div.getAttribute('hidden')).toBeNull();
  });

  it('should not display a message by default', () => {
    // Arrange
    const element = fixture.nativeElement;
    const span = element.querySelectorAll('span')[0];

    // Assert
    expect(span.textContent).toBe('');
  });

  it('should display specified message', () => {
    // Arrange
    const element = fixture.nativeElement;
    const span = element.querySelectorAll('span')[0];

    // Act
    fixture.componentInstance.message = 'testing';
    fixture.detectChanges();

    // Assert
    expect(span.textContent).toBe('testing');
  });
});
