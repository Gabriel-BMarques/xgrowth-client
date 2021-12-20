import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@app/shared';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { MaterialModule } from '@app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BriefsComponent } from './briefs.component';
import { BriefsRoutingModule } from './briefs-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BriefAcceptComponent } from './brief-accept/brief-accept.component';
import { BriefModalAcceptComponent } from './brief-accept/brief-modal-accept/brief-modal-accept.component';
import { BriefModalDeclineComponent } from './brief-accept/brief-modal-decline/brief-modal-decline.component';
import { BriefUploadComponent } from './brief-upload/brief-upload.component';
import { BriefUploadStepsComponent } from './brief-upload/brief-upload-steps/brief-upload-steps.component';
import { AddResponseComponent } from './add-response/add-response.component';
import { FileUploadModule } from 'primeng/fileupload';
import { AddAttachmentsComponent } from './add-response/add-attachments/add-attachments.component';
import { AttachmentsComponent } from './add-brief/attachments/attachments.component';
import { TermsComponent } from './add-response/terms/terms.component';
import { PreviewComponent } from './add-response/preview/preview.component';
import { BriefTypeModalComponent } from './add-brief/brief-type-modal/brief-type-modal.component';
import { BasicInfoComponent } from './add-brief/basic-info/basic-info.component';
import { MarketInfoComponent } from './add-brief/market-info/market-info.component';
import { BriefCategoriesComponent } from './add-brief/brief-categories/brief-categories.component';
import { TeamMembersComponent } from './add-brief/team-members/team-members.component';
import { SelectTeamMembersComponent } from './add-brief/team-members/select-team-members/select-team-members.component';
import { SelectSolversComponent } from './add-brief/solvers/select-solvers/select-solvers.component';
import { SolversComponent } from './add-brief/solvers/solvers.component';
import { AgreementComponent } from './add-brief/agreement/agreement.component';
import { BriefMarketComponent } from './add-brief/market-info/brief-market/brief-market.component';
import { BriefCompanyComponent } from './add-brief/market-info/brief-company/brief-company.component';
import { BriefDeadlineComponent } from './add-brief/market-info/brief-deadline/brief-deadline.component';
import { BriefReviewComponent } from './add-brief/brief-review/brief-review.component';
import { MyBriefComponent } from './my-brief/my-brief.component';
import { MyTeamMembersComponent } from './my-brief/my-team-members/my-team-members.component';
import { ParticipatingSolversComponent } from './my-brief/participating-solvers/participating-solvers.component';
import { CloseBriefComponent } from './my-brief/close-brief/close-brief.component';
import { PendingNdaComponent } from './pending-nda/pending-nda.component';
import { AcceptModalComponent } from './pending-nda/accept-modal/accept-modal.component';
import { DenyModalComponent } from './pending-nda/deny-modal/deny-modal.component';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import 'mousetrap';
import { ResponseSentConfirmationComponent } from './add-response/preview/response-sent-confirmation/response-sent-confirmation.component';
import { IncompleteOrganizationPopoverComponent } from './brief-accept/incomplete-organization-popover/incomplete-organization-popover.component';
import { BriefInactiveComponent } from './brief-accept/brief-inactive/brief-inactive.component';
import { BriefEmptyComponent } from './brief-loop/brief-empty/brief-empty.component';
import { ClickOutsideModule } from 'ng-click-outside';
import { InputMaskModule } from 'racoon-mask-raw';
import { CustomDateAdapter } from 'src/app/validators/CustomDateAdapter';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    IonicModule,
    Angulartics2Module,
    MaterialModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    FormsModule,
    FileUploadModule,
    ReactiveFormsModule,
    BriefsRoutingModule,
    ClickOutsideModule,
    GalleryModule.forRoot(),
    InputMaskModule,
    InfiniteScrollModule
  ],
  entryComponents: [
    BriefModalAcceptComponent,
    BriefModalDeclineComponent,
    BriefTypeModalComponent,
    SelectTeamMembersComponent,
    SelectSolversComponent,
    CloseBriefComponent,
    DenyModalComponent,
    AcceptModalComponent
  ],
  declarations: [
    BriefsComponent,
    BriefAcceptComponent,
    BriefUploadComponent,
    BriefUploadStepsComponent,
    BriefModalAcceptComponent,
    BriefModalDeclineComponent,
    BriefTypeModalComponent,
    AddResponseComponent,
    AddAttachmentsComponent,
    TermsComponent,
    PreviewComponent,
    BasicInfoComponent,
    AttachmentsComponent,
    MarketInfoComponent,
    BriefCategoriesComponent,
    TeamMembersComponent,
    SelectTeamMembersComponent,
    SolversComponent,
    SelectSolversComponent,
    AgreementComponent,
    BriefCompanyComponent,
    BriefMarketComponent,
    BriefDeadlineComponent,
    BriefReviewComponent,
    MyBriefComponent,
    MyTeamMembersComponent,
    ParticipatingSolversComponent,
    CloseBriefComponent,
    PendingNdaComponent,
    DenyModalComponent,
    AcceptModalComponent,
    ResponseSentConfirmationComponent,
    IncompleteOrganizationPopoverComponent,
    BriefInactiveComponent,
    BriefEmptyComponent
  ],
  providers: [{ provide: DateAdapter, useClass: CustomDateAdapter }]
})
export class BriefsModule {}
