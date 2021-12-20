import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@app/shared';
import { RegisterRoutingModule } from './register-routing.module';
import { RegisterComponent } from './register.component';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';

@NgModule({
  // tslint:disable-next-line: max-line-length
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule,
    IonicModule,
    RegisterRoutingModule,
    MatButtonModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatPasswordStrengthModule
  ],
  entryComponents: [RegisterComponent],
  declarations: [RegisterComponent]
})
export class RegisterModule {}
