import { Routes, RouterModule } from '@angular/router';
import { Shell } from '@app/shell/shell.service';
import { NgModule } from '@angular/core';
import { BriefsComponent } from './briefs.component';
import { extract } from '@app/core';
import { BriefAcceptComponent } from './brief-accept/brief-accept.component';
import { BriefUploadComponent } from './brief-upload/brief-upload.component';
import { BriefUploadStepsComponent } from './brief-upload/brief-upload-steps/brief-upload-steps.component';
import { AddResponseComponent } from './add-response/add-response.component';
import { AddAttachmentsComponent } from './add-response/add-attachments/add-attachments.component';
import { TermsComponent } from './add-response/terms/terms.component';
import { PreviewComponent } from './add-response/preview/preview.component';
import { BasicInfoComponent } from './add-brief/basic-info/basic-info.component';
import { AttachmentsComponent } from './add-brief/attachments/attachments.component';
import { MarketInfoComponent } from './add-brief/market-info/market-info.component';
import { BriefCategoriesComponent } from './add-brief/brief-categories/brief-categories.component';
import { TeamMembersComponent } from './add-brief/team-members/team-members.component';
import { SelectTeamMembersComponent } from './add-brief/team-members/select-team-members/select-team-members.component';
import { SolversComponent } from './add-brief/solvers/solvers.component';
import { SelectSolversComponent } from './add-brief/solvers/select-solvers/select-solvers.component';
import { BriefCompanyComponent } from './add-brief/market-info/brief-company/brief-company.component';
import { BriefMarketComponent } from './add-brief/market-info/brief-market/brief-market.component';
import { BriefDeadlineComponent } from './add-brief/market-info/brief-deadline/brief-deadline.component';
import { AgreementComponent } from './add-brief/agreement/agreement.component';
import { BriefReviewComponent } from './add-brief/brief-review/brief-review.component';
import { MyBriefComponent } from './my-brief/my-brief.component';
import { MyTeamMembersComponent } from './my-brief/my-team-members/my-team-members.component';
import { ParticipatingSolversComponent } from './my-brief/participating-solvers/participating-solvers.component';
import { PendingNdaComponent } from './pending-nda/pending-nda.component';
import { MyBriefGuard } from './guards/mybrief.guard';
import { AddResponseGuard } from './guards/add-response.guard';
import { BriefGuardGuard } from './guards/brief-guard.guard';
import { BriefAcceptGuard } from './guards/brief-accept.guard';

const routes: Routes = [
  {
    path: '',
    component: BriefsComponent,
    data: { title: extract('Briefs') }
  },
  {
    path: 'my-brief/:id',
    component: MyBriefComponent,
    data: { title: extract('Brief') },
    canActivate: [MyBriefGuard]
  },
  {
    path: 'my-brief/:id/my-team-members',
    component: MyTeamMembersComponent,
    data: { title: extract('Team Members') }
  },
  {
    path: 'my-brief/:id/participating-solvers',
    component: ParticipatingSolversComponent,
    data: { title: extract('Participating Solvers') }
  },
  {
    path: 'pending-nda',
    component: PendingNdaComponent,
    data: { title: extract('Pending NDAs') }
  },
  {
    path: 'accept/:id',
    component: BriefAcceptComponent,
    canActivate: [BriefAcceptGuard],
    data: { title: extract('Brief Acceptance') }
  },
  {
    path: 'upload/:id',
    component: BriefUploadComponent,
    data: { title: extract('Brief Upload NDA') }
  },
  {
    path: 'upload/steps/:id',
    component: BriefUploadStepsComponent
  },
  {
    path: 'add-response/:id',
    component: AddResponseComponent,
    canActivate: [AddResponseGuard],
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-response/edit/:id',
    component: AddResponseComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-response/attachments/:id',
    component: AddAttachmentsComponent,
    canActivate: [AddResponseGuard],
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-response/attachments/edit/:id',
    component: AddAttachmentsComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-response/terms/:id',
    component: TermsComponent,
    canActivate: [AddResponseGuard],
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-response/terms/edit/:id',
    component: TermsComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-response/preview/:id',
    component: PreviewComponent,
    canActivate: [AddResponseGuard],
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-response/preview/edit/:id',
    component: PreviewComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief',
    component: BasicInfoComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/edit/:id',
    component: BasicInfoComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/attachments',
    component: AttachmentsComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/attachments/edit/:id',
    component: AttachmentsComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/market-info',
    component: MarketInfoComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/market-info/edit/:id',
    component: MarketInfoComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/market-info/brief-company',
    component: BriefCompanyComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/market-info/brief-company/edit/:id',
    component: BriefCompanyComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/market-info/brief-market',
    component: BriefMarketComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/market-info/brief-market/edit/:id',
    component: BriefMarketComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/market-info/brief-deadline',
    component: BriefDeadlineComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/market-info/brief-deadline/edit/:id',
    component: BriefDeadlineComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/categories',
    component: BriefCategoriesComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/categories/edit/:id',
    component: BriefCategoriesComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/team-members',
    component: TeamMembersComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/team-members/edit/:id',
    component: TeamMembersComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/team-members/select-team-members',
    component: SelectTeamMembersComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/team-members/select-team-members/edit/:id',
    component: SelectTeamMembersComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/solvers',
    component: SolversComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/solvers/edit/:id',
    component: SolversComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/solvers/select-solvers',
    component: SelectSolversComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/solvers/select-solvers/edit/:id',
    component: SelectSolversComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/agreement',
    component: AgreementComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/agreement/edit/:id',
    component: AgreementComponent,
    canDeactivate: [BriefGuardGuard]
  },
  {
    path: 'add-brief/review',
    component: BriefReviewComponent,
    canDeactivate: [BriefGuardGuard]
  }
  // need to pass id to identify brief that was clicked
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class BriefsRoutingModule {}
