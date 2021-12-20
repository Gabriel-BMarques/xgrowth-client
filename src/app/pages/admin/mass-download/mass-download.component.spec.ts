import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MassDownloadComponent } from './mass-download.component';

describe('MassDownloadComponent', () => {
  let component: MassDownloadComponent;
  let fixture: ComponentFixture<MassDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MassDownloadComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MassDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
