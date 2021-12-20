import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { InterestsRoutingModule } from './interests-routing.module';
import { SharedModule } from '@app/shared';
import { InterestsComponent } from './interests.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, TranslateModule, IonicModule, InterestsRoutingModule, SharedModule, FormsModule],
  entryComponents: [InterestsComponent],
  declarations: [InterestsComponent]
})
export class InterestsModule {}
