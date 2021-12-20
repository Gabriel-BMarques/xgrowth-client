import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Angulartics2Module } from 'angulartics2';

import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { AdminCompanyRelationsComponent } from './company-relations.component';

describe('AdminCompanyRelationsComponent', () => {
  let component: AdminCompanyRelationsComponent;
  let fixture: ComponentFixture<AdminCompanyRelationsComponent>;

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
        declarations: [AdminCompanyRelationsComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCompanyRelationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
