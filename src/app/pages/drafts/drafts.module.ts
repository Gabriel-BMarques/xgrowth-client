import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@app/shared';
import { DraftsRoutingModule } from './drafts-routing.module';
import { DraftsComponent } from './drafts.component';

@NgModule({
  imports: [CommonModule, TranslateModule, IonicModule, DraftsRoutingModule, SharedModule],
  entryComponents: [DraftsComponent],
  declarations: [DraftsComponent]
})
export class DraftsModule {}
