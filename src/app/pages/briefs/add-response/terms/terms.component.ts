import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import { IResponse, Response } from '@app/shared/models/response.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IUploadedFile } from '@app/shared/models/uploadedFile.model';
import { HeaderService } from '@app/services/header.service';
import { ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { ResponseAddWizardService } from '@app/services/response-add-wizard.service';
import { NavigationService } from '@app/services/navigation.service';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit, IAlertControtllerGuard {
  isLoading = true;
  isEditing: boolean;
  header: string;
  id: string;
  termsAndConditions =
    'User submits information with the express acknowledgement that it imposes no confidentiality obligations on XGrowth or Content Receiver, unless a specific executed confidentiality, or like, agreement (but excluding general confidentiality clauses in an existing supply agreement) is expressly cited in the submission. Furthermore, User acknowledges that its submission does not breach any confidentiality obligations owed to others. User recognizes that Content Receiver may already be independently working on the same or similar growth opportunity (technology, innovation, new product or ingredient ideas, etc.) as covered by its submission. User agrees that no contractual obligation nor working relationship is created between User and Content Receiver by submitting this information. Each party shall own and continue to own all intellectual property it owned prior to the submission of this posting or brief response or that it created outside of the scope of this brief and/or agreement.';
  accepted = false;
  briefId: string;

  constructor(
    private headerService: HeaderService,
    private router: Router,
    private route: ActivatedRoute,
    private wizard: ResponseAddWizardService,
    private navigationService: NavigationService
  ) {}

  ngOnInit() {
    if (localStorage.getItem('language') === 'en=US') {
      this.header = 'Acknowledgement';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Reconhecimento';
    }

    this.isLoading = true;
    this.briefId = this.route.snapshot.params.id;
    this.isEditing = this.wizard.isEditing;
  }

  ionViewWillEnter() {}

  ionViewDidEnter() {
    this.id = this.wizard.entity._id;
    this.headerService.setHeader(this.header);
    this.isLoading = false;
  }

  toggleAccept() {}

  preview() {
    this.router.navigate(['/briefs/add-response/preview', this.briefId], { replaceUrl: true });
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-response/preview', this.briefId], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-response/preview', 'edit', this.wizard.entity._id], {
        replaceUrl: true
      });
    }
  }

  back() {
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-response/attachments', this.briefId], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-response/attachments', 'edit', this.wizard.entity._id], {
        replaceUrl: true
      });
    }
  }
  canDeactivate() {
    if (this.wizard.isEditing) {
      return this.navigationService.generateAlertBriefResponse(
        'Discard Brief Response?',
        'If you leave the brief response edition now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    } else {
      return this.navigationService.generateAlertBriefResponse(
        'Discard Brief Response?',
        'If you leave the brief response creation now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    }
  }
}
