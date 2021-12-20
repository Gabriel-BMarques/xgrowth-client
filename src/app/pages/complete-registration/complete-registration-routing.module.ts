import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Shell } from '@app/shell/shell.service';

import { extract } from '@app/core';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { CompanyInfoComponent } from './company-info/company-info.component';
import { CompanyCapabilitiesComponent } from './company-capabilities-1/company-capabilities-1.component';
import { CompanyCapabilities2Component } from './company-capabilities-2/company-capabilities-2.component';

const routes: Routes = [
  {
    path: 'complete-registration/personal-info',
    component: PersonalInfoComponent,
    data: { title: extract('Personal Information') }
  },
  {
    path: 'complete-registration/company-info',
    component: CompanyInfoComponent,
    data: { title: extract('Company Information') }
  },
  {
    path: 'complete-registration/company-capabilities-1',
    component: CompanyCapabilitiesComponent,
    data: { title: extract('Company Capabilities') }
  },
  {
    path: 'complete-registration/company-capabilities-2',
    component: CompanyCapabilities2Component,
    data: { title: extract('Company Capabilities') }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class CompleteRegistrationRoutingModule {}
