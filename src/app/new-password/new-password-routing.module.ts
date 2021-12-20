import { Routes, RouterModule } from '@angular/router';
import { NewPasswordComponent } from './new-password.component';
import { extract } from '@app/core';
import { NgModule } from '@angular/core';
import { FormGroup } from '@angular/forms';

const routes: Routes = [
  { path: 'new-password', component: NewPasswordComponent, data: { title: extract('New Password') } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class NewPasswordRoutingModule {}
