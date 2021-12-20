import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/core';
import { HomeComponent } from './home.component';
import { Shell } from '@app/shell/shell.service';
import { GuardDeletionGuard } from '../post/guards/guard-deletion.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canDeactivate: [GuardDeletionGuard],
    data: { title: extract('Home') }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
