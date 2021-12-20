import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ModalComponent } from './header/modal/modal.component';
import { ShellComponent } from './shell.component';
import { IonicSelectableModule } from 'ionic-selectable';
import { FileUploadModule } from 'primeng/fileupload';
import { HeaderComponent } from './header/header.component';
import { LanguageComponent } from './header/language/language.component';
import { TabsComponent } from './tabs/tabs.component';
import { SharedModule } from '@app/shared';
import { ProfilePopoverComponent } from './header/profile-popover/profile-popover.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    IonicModule,
    RouterModule,
    IonicSelectableModule,
    FileUploadModule,
    SharedModule
  ],
  entryComponents: [ShellComponent, ModalComponent, LanguageComponent],
  declarations: [
    ShellComponent,
    HeaderComponent,
    ModalComponent,
    LanguageComponent,
    TabsComponent,
    ProfilePopoverComponent
  ]
})
export class ShellModule {}
