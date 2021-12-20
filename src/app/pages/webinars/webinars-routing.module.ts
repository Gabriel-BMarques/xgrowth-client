import { ModalSubmit } from './add-webinar/modal-submit/modal-submit.component';
import { Routes, RouterModule } from '@angular/router';
import { Shell } from '@app/shell/shell.service';
import { NgModule } from '@angular/core';
import { extract } from '@app/core';
import { WebinarsComponent } from './webinars.component';
import { CoreInfoComponent } from './add-webinar/core-info/core-info.component';
import { TargetUsersComponent } from './add-webinar/target-users/target-users.component';
import { EditWebinarGuard } from './guards/edit-webinar.guard';
import { CreateWebinarGuard } from './guards/create-webinar.guard';

const routes: Routes = [
  {
    path: '',
    component: WebinarsComponent,
    data: { title: extract('Webinars') }
  },
  {
    path: 'core-info',
    component: CoreInfoComponent,
    canActivate: [CreateWebinarGuard]
  },
  {
    path: 'core-info/edit/:id',
    component: CoreInfoComponent,
    canActivate: [EditWebinarGuard]
  },
  {
    path: 'target-users',
    component: TargetUsersComponent,
    canActivate: [CreateWebinarGuard]
  },
  {
    path: 'target-users/edit/:id',
    component: TargetUsersComponent,
    canActivate: [EditWebinarGuard]
  },
  {
    path: 'modal-submit',
    component: ModalSubmit
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class WebinarsRoutingModule {}
