import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/core';
import { CompanyProfileComponent } from './profile/profile.component';
import { Shell } from '@app/shell/shell.service';
import { GuardDeletionGuard } from '../post/guards/guard-deletion.guard';

const routes: Routes = [
  {
    path: ':id/profile',
    component: CompanyProfileComponent,
    data: { title: extract('Organization Profile') },
    canDeactivate: [GuardDeletionGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule {}
