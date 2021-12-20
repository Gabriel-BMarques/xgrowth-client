import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { extract } from '@app/core';
import { OrganizationResolver } from '@app/shared/resolvers/organization.resolver';
import { OrganizationProfileOverviewComponent } from './profile/organization-profile-overview/organization-profile-overview.component';
import { OrganizationProducts } from './profile/organization-products/organization-products.component';
import { OrganizationEditComponent } from './profile/organization-edit/organization-edit.component';
import { OrganizationContentComponent } from './profile/organization-content/organization-content.component';

const routes: Routes = [
  {
    path: ':id/overview',
    component: OrganizationProfileOverviewComponent,
    data: { title: extract('Organization Profile') },
    resolve: { data: OrganizationResolver }
  },
  {
    path: ':id/edit',
    component: OrganizationEditComponent,
    data: { title: extract('Organization Edit') }
  },
  {
    path: ':id/products',
    component: OrganizationProducts,
    resolve: { data: OrganizationResolver },
    data: { title: extract('Organization Products') }
  },
  {
    path: ':id/content',
    component: OrganizationContentComponent,
    resolve: { data: OrganizationResolver },
    data: { title: extract('Organization Content') }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule {}
