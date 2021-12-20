import { Component, OnInit } from '@angular/core';
import { IPost } from '@app/shared/models/post.model';
import { Router, RoutesRecognized, ActivatedRoute } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';
import { DataService } from '@app/services/data.service';
import { IResponse } from '@app/shared/models/response.model';
import { MockService } from '@app/services/mock.service';
import { ResponseAddWizardService } from '@app/services/response-add-wizard.service';
import { NavigationService } from '@app/services/navigation.service';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { ResponseSentConfirmationComponent } from './response-sent-confirmation/response-sent-confirmation.component';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit, IAlertControtllerGuard {
  isLoading = false;
  isEditing: boolean;
  response: IResponse;
  responseMock: IResponse;
  responseId: string;
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };
  skeletonLoading = true;
  briefId: string;
  company: any;
  limit: number = 100;
  truncating = true;
  companyResponse: any;

  constructor(
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute,
    private mockService: MockService,
    private wizard: ResponseAddWizardService,
    private navigationService: NavigationService,
    private popover: PopoverController
  ) {}

  ngOnInit() {
    this.skeletonLoading = true;
    setTimeout(() => {
      this.response = this.mockService.generateItem('post');
      this.response.Title = this.wizard.step1Form.controls.name.value;
      this.response.Description = this.wizard.step1Form.controls.description.value;
      this.response.UploadedFiles = this.wizard.step1Form.controls.uploadedFiles.value;
      this.verifyFileTypes(this.response.UploadedFiles);
      this.response.Attachments = this.wizard.step2Form.controls.attachments.value;
      this.companyResponse = this.wizard.entity.SupplierId;
      this.dataService
        .getUserCompany()
        .toPromise()
        .then(company => {
          this.company = company.body;
          this.skeletonLoading = false;
        });
    }, 2000);
    this.isEditing = this.wizard.isEditing;
  }

  ionViewWillEnter() {}

  verifyFileTypes(files: any[]) {
    const videoFormats = ['mp4', 'avi', 'mov', 'mkv', 'mvi'];
    files.map(file => {
      if (videoFormats.includes(file.Type)) {
        file.isVideo = true;
        file.isImage = false;
      } else {
        file.isVideo = false;
        file.isImage = true;
      }
    });
  }

  ionViewDidEnter() {
    this.isLoading = true;
  }

  async publish() {
    this.wizard.submit();
    const popover = await this.popover.create({
      component: ResponseSentConfirmationComponent,
      cssClass: 'brief-response-confirm-popover'
    });
    popover.present();
    popover.onDidDismiss().then(() => {
      this.router.navigate(['/post/details', this.route.snapshot.params.id], { replaceUrl: true });
    });
  }

  back() {
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-response/terms', this.briefId]);
    } else {
      this.router.navigate(['/briefs/add-response/terms', 'edit', this.wizard.entity._id], {
        replaceUrl: true
      });
    }
  }

  public fallbackImage(i: number) {
    if (this.response.UploadedFiles[i]) {
      this.response.UploadedFiles[i].url = 'https://picsum.photos/id/122/130/160';
      return this.response.UploadedFiles[i].url;
    }
  }

  getThumbnailImage(url: string) {
    const image = 'https://weleverimages.blob.core.windows.net/app-images/' + url;
    return image;
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
