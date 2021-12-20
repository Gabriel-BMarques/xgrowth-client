import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@app/shared';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent, DialogActivationSuccessComponent } from './login.component';
import { MaterialModule } from '../material.module';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LanguageSwitchComponent } from './language-switch/language-switch.component';
import { ModalUpdateComponent } from './modal-update/modal-update.component';
import { ModalForgotPasswordComponent } from './modal-forgot-password/modal-forgot-password.component';

@NgModule({
  // tslint:disable-next-line: max-line-length
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule,
    IonicModule,
    LoginRoutingModule,
    MatButtonModule,
    MatFormFieldModule,
    SharedModule,
    RadioButtonModule,
    MatInputModule,
    MatRippleModule,
    MaterialModule
  ],
  entryComponents: [
    LoginComponent,
    LanguageSwitchComponent,
    DialogActivationSuccessComponent,
    ModalUpdateComponent,
    ModalForgotPasswordComponent
  ],
  declarations: [
    LoginComponent,
    LanguageSwitchComponent,
    DialogActivationSuccessComponent,
    ModalUpdateComponent,
    ModalForgotPasswordComponent
  ]
})
export class LoginModule {}
