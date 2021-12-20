import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { ViewSolversRoutingModule } from './view-solvers-routing.module';
import { SharedModule } from '@app/shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ViewSolversComponent } from './view-solvers.component';
import { ModalReferSolverComponent } from '@app/shared/modals/modal-refer-solver/modal-refer-solver.component';
import { ReferSolverPopoverComponent } from '@app/shared/modals/modal-refer-solver/refer-solver-popover/refer-solver-popover.component';
import { ClickOutsideModule } from 'ng-click-outside';
import { MaterialModule } from '../../material.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    IonicModule,
    ViewSolversRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ClickOutsideModule,
    MatCheckboxModule,
    MaterialModule,
    InfiniteScrollModule
  ],
  entryComponents: [ViewSolversComponent, ModalReferSolverComponent, ReferSolverPopoverComponent],
  declarations: [ViewSolversComponent]
})
export class ViewSolversModule {}
