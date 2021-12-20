import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@app/shared';
import { ReactivateRoutingModule } from './reactivate-routing.module';
import { ReactivateComponent } from './reactivate.component';
import { MaterialModule } from '../material.module';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  // tslint:disable-next-line: max-line-length
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule,
    IonicModule,
    ReactivateRoutingModule,
    MatButtonModule,
    MatFormFieldModule,
    SharedModule,
    RadioButtonModule,
    MatInputModule,
    MatRippleModule,
    MaterialModule
  ],
  entryComponents: [ReactivateComponent],
  declarations: [ReactivateComponent]
})
export class ReactivateModule {}
