import { CompleteRegisterGuard } from './complete-register.guard';
import { MyBriefGuard } from './../../pages/briefs/guards/mybrief.guard';
import { CompleteRegisterComponent } from './complete-register.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/core';

const routes: Routes = [
  {
    path: '',
    component: CompleteRegisterComponent,
    data: { title: extract('Complete Register') },
    canActivate: [CompleteRegisterGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompleteRegisterRoutingModule {}
