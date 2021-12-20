import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { ReactivateComponent } from './reactivate.component';

const routes: Routes = [{ path: '', component: ReactivateComponent, data: { title: extract('Reactivate') } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class ReactivateRoutingModule {}
