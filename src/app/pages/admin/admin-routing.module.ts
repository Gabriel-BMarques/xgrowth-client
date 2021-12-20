import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { extract } from '@app/core';
import { AdminGuard } from '@app/core/security/admin.guard';
import { Shell } from '@app/shell/shell.service';
import { BusinessUnitsComponent } from './business-units/business-units.component';
import { AdminCategoriesComponent } from './categories/categories.component';
import { AdminCompaniesComponent } from './companies/companies.component';
import { AdminCompanyRelationsComponent } from './company-relations/company-relations.component';
import { DepartmentsComponent } from './departments/departments.component';
import { JobTitlesComponent } from './job-titles/job-titles.component';
import { AdminLogComponent } from './log/log.component';
import { MassDownloadComponent } from './mass-download/mass-download.component';
import { MassUploadComponent } from './mass-upload/mass-upload.component';
import { AdminNotificationsComponent } from './notifications/notifications.component';
import { CategoriesOrganizationComponent } from './organization-categories/category-organization.component';
import { AdminOrganizationsComponent } from './organizations/organizations.component';
import { AdminReportsComponent } from './reports/reports.component';
import { SegmentsComponent } from './segments/segments.component';
import { SkillsComponent } from './skills/skills.component';
import { TutorialEditComponent } from './tutorials/tutorial-edit/tutorial-edit.component';
import { TutorialsComponent } from './tutorials/tutorials.component';
import { AdminUsersComponent } from './users/users.component';
import { WebinarsComponent } from './webinars/webinars.component';

const routes: Routes = [
  { path: 'business-unit', component: BusinessUnitsComponent, data: { title: extract('Business Units') } },
  { path: 'webinars', component: WebinarsComponent, data: { title: extract('Webinars') } },
  { path: 'categories', component: AdminCategoriesComponent, data: { title: extract('Categories') } },
  { path: 'companies', component: AdminCompaniesComponent, data: { title: extract('Companies') } },
  {
    path: 'company-relations',
    component: AdminCompanyRelationsComponent,
    data: { title: extract('Company Relations') }
  },
  {
    path: 'category-organization',
    component: CategoriesOrganizationComponent,
    data: { title: extract('Category Organization') }
  },
  { path: 'log', component: AdminLogComponent, data: { title: extract('Admin Log') } },
  { path: 'reports', component: AdminReportsComponent, data: { title: extract('Admin Reports') } },
  {
    path: 'notifications',
    component: AdminNotificationsComponent,
    data: { title: extract('Notifications') }
  },
  {
    path: 'organizations',
    component: AdminOrganizationsComponent,
    data: { title: extract('Organizations') }
  },
  { path: 'segments', component: SegmentsComponent, data: { title: extract('Segments') } },
  { path: 'skills', component: SkillsComponent, data: { title: extract('Skills') } },
  { path: 'job-titles', component: JobTitlesComponent, data: { title: extract('Job Titles') } },
  { path: 'departments', component: DepartmentsComponent, data: { title: extract('Departments') } },
  { path: 'tutorials', component: TutorialsComponent, data: { title: extract('Tutorials') } },
  { path: 'tutorials/add', component: TutorialEditComponent, data: { title: extract('Tutorial Add') } },
  { path: 'tutorials/edit/:id', component: TutorialEditComponent, data: { title: extract('Tutorial Edit') } },
  { path: 'mass-upload', component: MassUploadComponent, data: { title: extract('Mass Upload') } },
  { path: 'users', component: AdminUsersComponent, data: { title: extract('Users') } },
  { path: 'mass-download', component: MassDownloadComponent, data: { title: extract('Mass download') } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
