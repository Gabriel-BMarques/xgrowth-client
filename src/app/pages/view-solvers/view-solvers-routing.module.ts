import { Routes, RouterModule, Router } from '@angular/router';
import { Shell } from '@app/shell/shell.service';
import { extract } from '@app/core';
import { NgModule } from '@angular/core';
import { ViewSolversComponent } from './view-solvers.component';

const routes: Routes = [
  {
    path: '',
    component: ViewSolversComponent,
    data: { title: extract('Solvers') }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class ViewSolversRoutingModule {}
