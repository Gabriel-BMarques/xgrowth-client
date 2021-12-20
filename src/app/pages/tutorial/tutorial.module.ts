import { TutorialRoutingModule } from './tutorial-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@app/shared';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { MaterialModule } from '@app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FileUploadModule } from 'primeng/fileupload';
import { TutorialComponent } from './tutorial.component';
import { TutorialDetailsComponent } from './tutorial-details/tutorial-details.component';
import 'mousetrap';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    IonicModule,
    Angulartics2Module,
    MaterialModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    FormsModule,
    FileUploadModule,
    ReactiveFormsModule,
    TutorialRoutingModule
  ],
  entryComponents: [],
  declarations: [TutorialComponent, TutorialDetailsComponent],
  exports: [TutorialDetailsComponent]
})
export class TutorialModule {}
