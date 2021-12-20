import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { SharedModule } from '@app/shared';
import { PostRoutingModule } from './post-routing.module';
import { PostComponent } from './post.component';
import { PostAddComponent } from './add/post-add.component';
import { PostPreviewComponent } from './add/preview/preview.component';
import { PostCategoriesComponent } from './add/post-categories/post-categories.component';
import { AddCategoriesComponent } from './add/add-categories/add-categories.component';
import { TermsAndConditionsComponent } from './add/terms-and-conditions/terms-and-conditions.component';
import { FileUploadModule } from 'primeng/fileupload';
import { CollectionModalComponent } from '../post/collection-modal/collection-modal.component';
import { ShareComponent } from './share/share.component';
import 'mousetrap';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    IonicModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    PostRoutingModule,
    FileUploadModule
  ],
  // entryComponents: [CollectionModalComponent],
  declarations: [
    PostComponent,
    PostAddComponent,
    PostPreviewComponent,
    PostCategoriesComponent,
    AddCategoriesComponent,
    TermsAndConditionsComponent,
    CollectionModalComponent,
    ShareComponent
  ]
})
export class PostModule {}
