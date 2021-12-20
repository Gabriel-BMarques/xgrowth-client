import { Routes, RouterModule } from '@angular/router';
import { Shell } from '@app/shell/shell.service';
import { NgModule } from '@angular/core';
import { extract } from '@app/core';
import { TutorialComponent } from './tutorial.component';
import { TutorialDetailsComponent } from './tutorial-details/tutorial-details.component';

const routes: Routes = [
  {
    path: '',
    component: TutorialComponent,
    data: { title: extract('Tutorial') }
  },
  {
    path: 'details/:id',
    component: TutorialDetailsComponent,
    data: { title: extract('Tutorial Details') }
  }
];
// need to pass id to identify brief that was clicked

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TutorialRoutingModule {}
