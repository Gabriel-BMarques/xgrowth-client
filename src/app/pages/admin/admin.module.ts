import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalCategoryComponent } from '@app/pages/admin/organization-categories/modal-category/modalCategory.component';
import { SharedModule } from '@app/shared';
import { ModalPageComponent } from '@app/shared/modals/modal/modal.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { Angulartics2Module } from 'angulartics2';
import { IonicSelectableModule } from 'ionic-selectable';
import { FileUploadModule } from 'primeng/fileupload';
import { MaterialModule } from '../../material.module';
import { AdminRoutingModule } from './admin-routing.module';
import { BusinessUnitsComponent } from './business-units/business-units.component';
import { ModalBusinessUnitsComponent } from './business-units/modal-business-units/modal-business-units.component';
import { AdminCategoriesComponent } from './categories/categories.component';
import { AdminCompaniesComponent } from './companies/companies.component';
import { AdminCompanyRelationsComponent } from './company-relations/company-relations.component';
import { DepartmentsComponent } from './departments/departments.component';
import { ModalDepartmentsComponent } from './departments/modal-department/modal-departments.component';
import { JobTitlesComponent } from './job-titles/job-titles.component';
import { ModalJobTitleComponent } from './job-titles/modal-jobtitles/modal-job-title.component';
import { AdminLogComponent } from './log/log.component';
import { MassDownloadComponent } from './mass-download/mass-download.component';
import { MassUploadComponent } from './mass-upload/mass-upload.component';
import { AdminNotificationsComponent } from './notifications/notifications.component';
import { CategoriesOrganizationComponent } from './organization-categories/category-organization.component';
import { AdminOrganizationsComponent } from './organizations/organizations.component';
import { AdminReportsComponent } from './reports/reports.component';
import { ModalSegmentsComponent } from './segments/modal-segments/modal-segments.component';
import { SegmentsComponent } from './segments/segments.component';
import { ModalSkillsComponent } from './skills/modal-skills/modal-skills.component';
import { SkillsComponent } from './skills/skills.component';
import { ModalImageResize } from './tutorials/modal-image-resize/modal-image-resize.component';
import { TutorialEditComponent } from './tutorials/tutorial-edit/tutorial-edit.component';
import { TutorialsComponent } from './tutorials/tutorials.component';
import { AdminUsersComponent } from './users/users.component';
import { ModalGuestListComponent } from './webinars/modal-guest-list/modal-guest-list.component';
import { ModalWebinarDenialComponent } from './webinars/modal-webinar-denial/modal-webinar-denial.component';
import { ModalWebinarDetailsComponent } from './webinars/modal-webinar-details/modal-webinar-details.component';
import { WebinarsComponent } from './webinars/webinars.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    IonicModule,
    Angulartics2Module,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    IonicSelectableModule,
    AdminRoutingModule,
    FileUploadModule
  ],
  entryComponents: [
    ModalPageComponent,
    ModalCategoryComponent,
    ModalSegmentsComponent,
    ModalSkillsComponent,
    ModalBusinessUnitsComponent
  ],
  declarations: [
    AdminCompaniesComponent,
    AdminCategoriesComponent,
    AdminCompanyRelationsComponent,
    AdminLogComponent,
    AdminReportsComponent,
    AdminNotificationsComponent,
    AdminOrganizationsComponent,
    AdminUsersComponent,
    ModalPageComponent,
    ModalCategoryComponent,
    SegmentsComponent,
    ModalSegmentsComponent,
    CategoriesOrganizationComponent,
    SkillsComponent,
    ModalSkillsComponent,
    BusinessUnitsComponent,
    ModalBusinessUnitsComponent,
    JobTitlesComponent,
    ModalJobTitleComponent,
    DepartmentsComponent,
    ModalDepartmentsComponent,
    WebinarsComponent,
    ModalWebinarDetailsComponent,
    ModalGuestListComponent,
    ModalWebinarDenialComponent,
    TutorialsComponent,
    TutorialEditComponent,
    ModalImageResize,
    MassUploadComponent,
    MassDownloadComponent
  ]
})
export class AdminModule {}
