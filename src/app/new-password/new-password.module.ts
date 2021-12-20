import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '@app/shared';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MaterialModule } from '@app/material.module';
import { LanguageSwitchComponent } from '@app/login/language-switch/language-switch.component';
import { DialogActivationSuccessComponent } from '@app/login/login.component';
import { ModalUpdateComponent } from '@app/login/modal-update/modal-update.component';
import { NewPasswordRoutingModule } from './new-password-routing.module';
import { NewPasswordComponent } from './new-password.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule,
    IonicModule,
    NewPasswordRoutingModule,
    MatButtonModule,
    MatFormFieldModule,
    SharedModule,
    RadioButtonModule,
    MatInputModule,
    MatRippleModule,
    MaterialModule
  ],
  entryComponents: [NewPasswordComponent],
  declarations: [NewPasswordComponent]
})
export class NewPasswordModule {}
