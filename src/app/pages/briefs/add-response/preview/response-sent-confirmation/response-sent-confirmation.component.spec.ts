import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseSentConfirmationComponent } from './response-sent-confirmation.component';

describe('ResponseSentConfirmationComponent', () => {
  let component: ResponseSentConfirmationComponent;
  let fixture: ComponentFixture<ResponseSentConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResponseSentConfirmationComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponseSentConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
