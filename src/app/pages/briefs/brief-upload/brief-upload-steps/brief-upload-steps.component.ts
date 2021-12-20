import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@env/environment';
import { IBrief } from '@app/shared/models/brief.model';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { ModalController, NavController } from '@ionic/angular';
import { DataService } from '@app/services/data.service';
import { FileUpload } from 'primeng/fileupload';
import { FilesService } from '@app/services/files.service';
import { NotificationService } from '@app/services/notification.service';
import { BriefUploadService } from '../brief-upload.service';
import * as _ from 'lodash';
import { UserInfoService } from '@app/services/user-info.service';
import { ContactModalComponent } from '@app/shared/modals/contact-modal/contact-modal.component';

declare let woopra: any;

@Component({
  selector: 'app-brief-upload-steps',
  templateUrl: './brief-upload-steps.component.html',
  styleUrls: ['./brief-upload-steps.component.scss']
})
export class BriefUploadStepsComponent implements OnInit {
  @ViewChild('fileInput')
  fileInput: FileUpload;
  isLoading = true;
  brief: IBrief;
  nda: any;
  briefId: string;
  company: ICompanyProfile;
  files: string[] = [];
  delFilesArray: any[] = [];
  ndaFileName: string;
  briefSupplier: any;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private navCntrl: NavController,
    private fileService: FilesService,
    private notificationService: NotificationService,
    private briefUploadService: BriefUploadService,
    private userInfoService: UserInfoService,
    private modalController: ModalController
  ) {}

  get userInfo(): any {
    return this.userInfoService.storedUserInfo;
  }

  async ngOnInit() {
    this.briefId = this.route.snapshot.params.id;
    await this.refreshData();
    this.isLoading = false;
  }

  ionViewWillEnter() {
    this.userInfoService.refreshUserInfo();
  }

  ionViewDidEnter() {}

  getSignedNda() {
    if (this.briefSupplier && this.briefSupplier.SignedNdaFile) {
      this.files.push(this.getBlobName(this.briefSupplier.SignedNdaFile.url));
    }
  }

  async refreshData() {
    await this.dataService
      .getUserCompany()
      .toPromise()
      .then(res => {
        this.company = res.body;
      });

    await this.dataService
      .find('/brief', this.briefId)
      .toPromise()
      .then(res => {
        this.brief = res.body;
      });

    await this.dataService
      .list('/brief-supplier', { SupplierId: this.company._id, BriefId: this.brief._id })
      .toPromise()
      .then(res => {
        this.briefSupplier = res.body[0];
      });

    this.getSignedNda();

    if (this.brief.Nda) {
      this.nda = this.brief.Nda;
    } else {
      this.nda = this.briefSupplier.Nda;
    }
  }

  createNotifications() {
    this.dataService
      .list('/brief-member', { BriefId: this.briefId, Admin: true })
      .toPromise()
      .then(res => {
        const briefAdmins = res.body.map(adm => adm.UserId._id);
        let notificationReceivers: string[] = [this.brief.CreatedBy._id];
        if (briefAdmins.length) {
          notificationReceivers = notificationReceivers.concat(briefAdmins);
          notificationReceivers = _.uniqWith(notificationReceivers, _.isEqual);
        }
        const brief = this.brief;
        this.notificationService.sendBriefUploadNotification(brief, this.company, notificationReceivers);
      });
  }

  async downloadNda(url: string, fileName: string) {
    this.fileService.download(url, fileName);
    this.briefUploadService.isDownloaded = true;
  }

  uploadNda(event: any) {
    this.ndaFileName = event.files[0].name;
    const fileCount: number = event.files.length;
    this.briefSupplier.isLoadingNda = true;
    let formData;
    if (fileCount === 0) {
      this.fileInput.clear();
    } else {
      event.files.map((file: any) => {
        formData = new FormData();
        formData.append('file', file);
        this.dataService
          .upload('/upload', formData)
          .toPromise()
          .then(res => {
            if (environment.production) this.woopraIdentify(this.userInfo), this.woopraTrack(this.userInfo);
            this.files = [res.body.blob];
            this.briefSupplier.SignedNdaFile = {
              name: this.ndaFileName,
              url: this.getThumbnailFile(res.body.blob)
            };
            this.briefSupplier.SignedNda = true;
            this.briefSupplier.SignedNdaOn = Date.now();
            this.briefSupplier.NdaAcceptance = 3;
            this.dataService
              .update('/brief-supplier', this.briefSupplier)
              .toPromise()
              .then(() => {
                this.briefSupplier.isLoadingNda = false;
              });
          });
        this.fileInput.clear();
      });
    }
  }

  async openContactModal(modalTitle: string, receiverEmail: string): Promise<void> {
    (
      await this.modalController.create({
        cssClass: 'contact-modal',
        component: ContactModalComponent,
        componentProps: {
          modalTitle,
          receiverEmail
        }
      })
    ).present();
  }

  woopraIdentify(user: any) {
    woopra
      .identify({
        email: user.email,
        id: user.email,
        name: `${user.firstName} ${user.familyName}`,
        firstname: user.firstName,
        familyname: user.familyName,
        company: user.company?.companyName,
        department: user.department,
        jobTitle: user.jobTitle
      })
      .push();
  }
  woopraTrack(user: any) {
    woopra.track('nda upload', {
      author: user.email,
      id: user.email,
      name: user.email,
      company: user.company.companyName,
      department: user.department,
      jobTitle: user.jobTitle,
      topic: 'Uploaded NDA File',
      title: document.title,
      url: window.location.href
    });
  }

  deleteFileOfArray(request: any) {
    const selectedFile = this.getBlobName(request.url);
    this.files.map((file, index: number = 0) => {
      if (selectedFile === file) {
        this.delFilesArray.push(this.getBlobName(request.url));
        this.files.splice(index, 1);
        this.briefSupplier.SignedNdaFile = null;
        this.briefSupplier.SignedNda = false;
        this.dataService
          .update('/brief-supplier', this.briefSupplier)
          .toPromise()
          .then(() => {});
      }
    });
    this.deletePermanently();
  }

  deletePermanently() {
    this.dataService
      .deleteFile('/upload', this.delFilesArray)
      .toPromise()
      .then(res => {
        res.body.map((index: number = 0) => {
          res.body.push(this.delFilesArray[index]);
          index++;
        });
      });
  }

  getThumbnailFile(url: any) {
    const Nda = 'https://weleverimages.blob.core.windows.net/app-images/' + url;
    return Nda;
  }

  getBlobName(url: string) {
    const blobName = url.split('https://weleverimages.blob.core.windows.net/app-images/').pop();
    return blobName;
  }

  back() {
    this.navCntrl.navigateBack(['/briefs/upload/', this.briefId], { replaceUrl: true });
  }

  done() {
    this.createNotifications();
    this.navCntrl.navigateBack(['/briefs/upload/', this.briefId], { replaceUrl: true });
  }

  get firstStepOK(): boolean {
    return this.briefUploadService.isDownloaded === true || this.secondStepOK;
  }

  get secondStepOK(): boolean {
    let hasSignedNda: boolean;
    if (this.briefSupplier.SignedNdaFile) {
      hasSignedNda = true;
    } else {
      hasSignedNda = false;
    }
    return hasSignedNda;
  }
}
