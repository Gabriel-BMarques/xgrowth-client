import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InterestsComponent } from './interests.component';
import { extract } from '@app/core';
import { Shell } from '@app/shell/shell.service';
import { InterestsGuard } from './interests.guard';

const routes: Routes = [
  {
    path: '',
    component: InterestsComponent,
    canDeactivate: [InterestsGuard],
    data: { title: extract('Interests') }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InterestsRoutingModule {}
