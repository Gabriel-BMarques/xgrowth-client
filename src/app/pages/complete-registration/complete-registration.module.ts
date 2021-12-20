import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../shared';
import { CompleteRegistrationRoutingModule } from './complete-registration-routing.module';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { CompanyInfoComponent } from './company-info/company-info.component';
import { CompanyCapabilitiesComponent } from './company-capabilities-1/company-capabilities-1.component';
import { CompanyCapabilities2Component } from './company-capabilities-2/company-capabilities-2.component';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MaterialModule } from '../../material.module';
import { RadioButtonModule } from 'primeng/radiobutton';

@NgModule({
  // tslint:disable-next-line: max-line-length
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule,
    IonicModule,
    CompleteRegistrationRoutingModule,
    MatButtonModule,
    MaterialModule,
    RadioButtonModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule
  ],
  entryComponents: [
    PersonalInfoComponent,
    CompanyInfoComponent,
    CompanyCapabilitiesComponent,
    CompanyCapabilities2Component
  ],
  declarations: [
    PersonalInfoComponent,
    CompanyInfoComponent,
    CompanyCapabilitiesComponent,
    CompanyCapabilities2Component
  ]
})
export class CompleteRegistrationModule {}
