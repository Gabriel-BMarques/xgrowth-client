import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MaterialModule } from './../../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CompleteRegisterRoutingModule } from './complete-register-routing.module';
import { CompleteRegisterComponent } from './complete-register.component';
@NgModule({
  // tslint:disable-next-line: max-line-length
  imports: [
    CompleteRegisterRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MatFormFieldModule,
    SharedModule,
    CommonModule,
    TranslateModule
  ],
  entryComponents: [CompleteRegisterComponent],
  declarations: [CompleteRegisterComponent]
})
export class CompleteRegisterModule {}
