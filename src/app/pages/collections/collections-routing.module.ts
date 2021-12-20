import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/core';
import { MyCollectionsComponent } from './my-collections/my-collections.component';
import { CollectionDetailsComponent } from './collection-details/collection-details.component';
import { Shell } from '@app/shell/shell.service';
import { AddmembersComponent } from './add-members/add-members.component';

const routes: Routes = [
  {
    path: 'my-collections',
    component: MyCollectionsComponent,
    data: { title: extract('My Collections') }
  },
  {
    path: ':id/collection-details',
    component: CollectionDetailsComponent,
    data: { title: extract('Collection Details') }
  },
  {
    path: ':id/add-members',
    component: AddmembersComponent,
    data: { title: extract('Add Members') }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollectionsRoutingModule {}
