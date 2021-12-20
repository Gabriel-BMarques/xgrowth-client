import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@app/shared';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { MaterialModule } from '@app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WebinarsRoutingModule } from './webinars-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import { FileUploadModule } from 'primeng/fileupload';
import { WebinarsComponent } from './webinars.component';
import { CoreInfoComponent } from './add-webinar/core-info/core-info.component';
import { TargetUsersComponent } from './add-webinar/target-users/target-users.component';
import { TutorialModule } from '../tutorial/tutorial.module';
import { ModalWebinarReview } from './webinar-details/modal-webinar-review.component';
import { ModalSubmit } from './add-webinar/modal-submit/modal-submit.component';
import 'mousetrap';
import { WebinarCardComponent } from './webinar-card/webinar-card.component';

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
    WebinarsRoutingModule,
    GalleryModule.forRoot(),
    TutorialModule
  ],
  declarations: [
    WebinarsComponent,
    ModalWebinarReview,
    CoreInfoComponent,
    TargetUsersComponent,
    ModalSubmit,
    WebinarCardComponent
  ]
})
export class WebinarsModule {}
