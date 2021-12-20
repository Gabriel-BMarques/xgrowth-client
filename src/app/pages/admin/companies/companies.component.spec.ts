import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Angulartics2Module } from 'angulartics2';

import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { AdminCompaniesComponent } from './companies.component';

describe('AdminCompaniesComponent', () => {
  let component: AdminCompaniesComponent;
  let fixture: ComponentFixture<AdminCompaniesComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          IonicModule.forRoot(),
          RouterTestingModule,
          Angulartics2Module.forRoot(),
          CoreModule,
          SharedModule,
          HttpClientTestingModule
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        declarations: [AdminCompaniesComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCompaniesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
