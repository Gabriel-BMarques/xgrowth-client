import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { NavigationService } from '@app/services/navigation.service';
import { UserInfoService } from '@app/services/user-info.service';
import { ContactModalComponent } from '@app/shared/modals/contact-modal/contact-modal.component';
import { IUser } from '@app/shared/models/user.model';
import { UserAction } from '@app/shared/models/userAction.model';
import { ModalController } from '@ionic/angular';
import { BriefUploadService } from './brief-upload.service';

@Component({
  selector: 'app-brief-upload',
  templateUrl: './brief-upload.component.html',
  styleUrls: ['./brief-upload.component.scss']
})
export class BriefUploadComponent implements OnInit {
  isLoading = true;
  brief: any;
  briefId: string;
  briefSupplier: any;
  user: IUser;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private navigationService: NavigationService,
    private briefUploadService: BriefUploadService,
    private userInfoService: UserInfoService,
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    this.briefId = this.route.snapshot.params.id;
    await this.userInfoService.refreshUserInfo();
    this.user = this.userInfoService.storedUserInfo;
    await Promise.all([this.refreshData(), this.userActionViewBrief()]);
    this.isLoading = false;
    console.log(this.brief.ClientId.logo);
  }

  ionViewWillEnter() {}

  ionViewDidEnter() {}

  async refreshData() {
    let company: any;

    await this.dataService
      .getUserCompany()
      .toPromise()
      .then(res => {
        company = res.body;
      });

    await this.dataService
      .find('/brief', this.briefId)
      .toPromise()
      .then(brief => {
        this.brief = brief.body;
        console.log(this.brief);
        this.navigationService.brief = this.brief;
      });

    await this.dataService
      .list('/brief-supplier', { BriefId: this.briefId, SupplierId: company._id })
      .toPromise()
      .then(res => {
        this.briefSupplier = res.body[0];
        this.navigationService.briefSupplier = this.briefSupplier;
      });
  }

  async userActionViewBrief() {
    const userView = new UserAction();
    userView.UserId = this.user.id;
    userView.BriefId = this.briefId;
    userView.Type = 1;
    userView.CompanyId = this.user.company._id;
    await this.dataService.create('/users/user-action', userView).toPromise();
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

  followSteps() {
    this.router.navigate(['/briefs/upload/steps', this.briefId], { replaceUrl: true });
  }

  back() {
    this.router.navigate(['/briefs'], { replaceUrl: true });
  }

  fallbackImage(i: number) {
    if (this.brief.UploadedFiles[i]) {
      this.brief.UploadedFiles[i].url = 'https://picsum.photos/id/122/130/160';
      return this.brief.UploadedFiles[i].url;
    }
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
