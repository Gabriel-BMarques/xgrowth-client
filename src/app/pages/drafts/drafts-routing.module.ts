import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/core';
import { DraftsComponent } from './drafts.component';

const routes: Routes = [{ path: '', component: DraftsComponent, data: { title: extract('Drafts') } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class DraftsRoutingModule {}
