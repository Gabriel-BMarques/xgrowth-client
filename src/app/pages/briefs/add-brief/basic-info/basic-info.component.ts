import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';
import { DataService } from '@app/services/data.service';
import { FilesService } from '@app/services/files.service';
import { HeaderService } from '@app/services/header.service';
import { MediaService } from '@app/services/media.service';
import { NavigationService } from '@app/services/navigation.service';
import { UserInfoService } from '@app/services/user-info.service';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { ModalValidationComponent } from '@app/shared/modals/modal-validation/modal-validation.component';
import { IUploadedFile } from '@app/shared/models/uploadedFile.model';
import { environment } from '@env/environment';
import { ModalController, PopoverController } from '@ionic/angular';
import * as _ from 'lodash';
import { FileUpload } from 'primeng/fileupload';
import { debounceTime } from 'rxjs/operators';

declare let woopra: any;

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss']
})
export class BasicInfoComponent implements OnInit, IAlertControtllerGuard {
  isLoading = true;
  header: string;
  @ViewChild('fileInput')
  fileInput: FileUpload;
  isEditing: boolean;
  brief: any;
  briefInfoForm!: FormGroup;
  images: string[] = [];
  imagesUrls: [];
  selectedImage: string;
  delImagesArray: string[] = [];
  file: IUploadedFile;
  briefId: string;
  files: any[] = [];
  _haveFiles: boolean;
  loadingFiles = false;
  filesCopy: any[] = [];
  mainMessage: string;
  secondaryMessage: string;

  constructor(
    private headerService: HeaderService,
    public wizard: BriefAddWizardService,
    public modalController: ModalController,
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute,
    private navigationService: NavigationService,
    private fileService: FilesService,
    private mediaService: MediaService,
    private popover: PopoverController,
    private userInfoService: UserInfoService
  ) {
    this.loadForm();
    this.wizard.loadWizard();
  }

  get userInfo(): any {
    return this.userInfoService.storedUserInfo;
  }

  async ngOnInit() {
    if (localStorage.getItem('language') === 'en=US') {
      this.header = 'Basic Info';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Informações Básicas';
    }

    this.wizard.currentView = 1;
    this.verifyHeaderLang();
    this.headerService.setHeader(this.header);
    this.wizard.setMode(this.route.snapshot.params.id);
    if (this.wizard.isEditing) {
      await this.dataService
        .find('/brief', this.route.snapshot.params.id)
        .toPromise()
        .then(brief => {
          this.wizard.prepareDataToEdit(brief.body);
          this.loadData();
        });
    } else {
      this.loadData();
    }
    this.isLoading = false;
  }

  ionViewWillEnter() {
    this.userInfoService.refreshUserInfo();
  }

  loadForm() {
    this.briefInfoForm = _.cloneDeep(this.wizard.step1Form);
    const interval = setInterval(() => {
      if (document.readyState === 'complete') {
        this.onChanges();
        clearInterval(interval);
      }
    }, 100);
  }

  loadData() {
    if (environment.production) this.woopraIdentify(this.userInfo), this.woopraTrack(this.userInfo);
    this.briefInfoForm = _.cloneDeep(this.wizard.step1Form);
    if (!this.wizard.isEditing) {
      this.getBriefType();
    }
    this.files = this.briefInfoForm.controls.uploadedFiles.value;
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
    woopra.track('add new brief click', {
      author: user.email,
      id: user.email,
      name: user.email,
      company: user.company.companyName,
      department: user.department,
      jobTitle: user.jobTitle,
      topic: 'Add New Brief Click',
      title: document.title,
      url: window.location.href
    });
  }

  woopraTrackCancel(user: any) {
    woopra.track('cancelled add new brief', {
      author: user.email,
      id: user.email,
      name: user.email,
      company: user.company.companyName,
      department: user.department,
      jobTitle: user.jobTitle,
      topic: 'Cancelled Add New Brief',
      title: document.title,
      url: window.location.href
    });
  }

  saveEditChanges() {
    this.wizard.step1Form = _.cloneDeep(this.briefInfoForm);
    const finish = true;
    this.wizard.saveChanges(finish);
    this.router.navigate(['briefs', 'my-brief', this.wizard.entity._id], { replaceUrl: true });
  }

  getBriefType() {
    const briefType = this.wizard.briefType;
    if (briefType) {
      this.dataService
        .find('/brief/brief-type', briefType)
        .toPromise()
        .then(found => {
          this.wizard.entity.type = found.body;
        });
    } else {
      this.router.navigate(['/briefs'], { replaceUrl: true });
    }
  }

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en=US') {
      this.header = 'Basic Info';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Informações Básicas';
    }
  }

  isVideo(type: string) {
    const videoFormats = ['mp4', 'wmv', 'avi', 'mov'];
    if (videoFormats.includes(type)) {
      return true;
    } else {
      return false;
    }
  }

  getVideoThumbnail(url: string) {
    return this.mediaService.getVideoSource(url, 'thumbnail.png');
  }

  upload(event: any) {
    this.fileService.upload(event, this.files, this.fileInput, this.briefInfoForm.controls.uploadedFiles, 'image');
  }

  getThumbnailImage(url: string) {
    const image = 'https://weleverimages.blob.core.windows.net/app-images/' + url;
    return image;
  }

  getBlobName(url: string) {
    const blobName = url.split('https://weleverimages.blob.core.windows.net/app-images/').pop();
    return blobName;
  }

  fallbackImage(i: number) {
    if (this.brief.UploadedFiles[i]) {
      this.brief.UploadedFiles[i].url = 'https://picsum.photos/id/122/130/160';
      return this.brief.UploadedFiles[i].url;
    }
  }

  deleteImageOfArray(request: any) {
    this.selectedImage = request;
    this.files.map((img, index: number = 0) => {
      if (this.selectedImage === img.url) {
        this.delImagesArray.push(this.getBlobName(img.url));
        this.files.splice(index, 1);
        this.briefInfoForm.controls.uploadedFiles.setValue(this.files);
      }
      index++;
    });
    this.deletePermanently();
  }

  onChanges() {
    this.briefInfoForm.controls.name.valueChanges.pipe(debounceTime(1000)).subscribe(() => {
      this.wizard.step1Form = _.cloneDeep(this.briefInfoForm);
      this.wizard.saveChanges();
    });
    this.briefInfoForm.controls.description.valueChanges.pipe(debounceTime(1000)).subscribe(() => {
      this.wizard.step1Form = _.cloneDeep(this.briefInfoForm);
      this.wizard.saveChanges();
    });
    this.briefInfoForm.controls.uploadedFiles.valueChanges.subscribe(() => {
      this.wizard.step1Form = _.cloneDeep(this.briefInfoForm);
      this.wizard.saveChanges();
    });
  }

  doReorder(ev: any) {
    this.files = ev.detail.complete(this.files);
    this.briefInfoForm.controls.uploadedFiles.setValue(this.files);
  }

  delArraySize() {
    return this.delArraySize.length;
  }

  deletePermanently() {
    this.dataService
      .deleteFile('/upload', this.delImagesArray)
      .toPromise()
      .then(res => {
        res.body.map((index: number = 0) => {
          res.body.push(this.delImagesArray[index]);
          index++;
        });
      });
  }

  isValid() {
    if (this.briefInfoForm.touched || this.briefInfoForm.invalid) {
      return false;
    } else {
      return true;
    }
  }

  async openBriefValidationModal() {
    const modal = await this.popover.create({
      component: ModalValidationComponent,
      componentProps: { mainMessage: this.mainMessage, secondaryMessage: this.secondaryMessage, textButton: 'Ok' },
      cssClass: 'brief-type-modal'
    });

    modal.present();
  }

  briefFormValidation() {
    if (!this.haveFiles) {
      this.mainMessage = "You can't move forward without adding the media.";
      this.secondaryMessage = 'Upload it to proceed.';
      return 1;
    } else if (this.briefInfoForm.controls.name.invalid) {
      this.mainMessage = "You can't move forward without adding the title.";
      this.secondaryMessage = 'Insert it to proceed.';
      return 1;
    } else if (this.briefInfoForm.controls.description.invalid) {
      this.mainMessage = "You can't move forward without adding the description.";
      this.secondaryMessage = 'Insert it to proceed.';
      return 1;
    }
    return 0;
  }

  next() {
    if (this.briefFormValidation()) return this.openBriefValidationModal();

    this.wizard.step1Form = _.cloneDeep(this.briefInfoForm);
    this.wizard.saveChanges();
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/attachments'], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/attachments', 'edit', this.wizard.entity._id], { replaceUrl: true });
    }
  }

  get haveFiles() {
    if (this.files.length) {
      const urls = this.files.filter(file => {
        return file.url !== undefined;
      });
      if (urls.length < this.files.length) {
        this._haveFiles = false;
      } else {
        this._haveFiles = true;
      }
    } else {
      this._haveFiles = false;
    }
    return this._haveFiles;
  }

  set haveFiles(state: boolean) {
    this._haveFiles = state;
  }

  async cancel() {
    if (environment.production) this.woopraIdentify(this.userInfo), this.woopraTrackCancel(this.userInfo);
    this.brief = this.wizard.entityCopy;
    this.wizard.reset();
    if (this.brief._id !== undefined) {
      await this.dataService.update('/brief', this.brief).toPromise();
      this.router.navigate(['briefs', 'my-brief', this.brief._id], { replaceUrl: true });
    } else {
      console.log('CAIU NO CANCEL');
      this.router.navigate(['briefs'], { replaceUrl: true });
    }
  }
  canDeactivate() {
    if (this.wizard.isEditing && this.briefInfoForm.touched) {
      return this.navigationService.generateAlertBrief(
        'Discard Brief?',
        'If you leave the brief edition now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    } else if (!this.wizard.isEditing && !this.briefInfoForm.pristine) {
      return this.navigationService.generateAlertBrief(
        'Discard Brief?',
        'If you leave the brief creation now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    } else {
      // bypass guard
      return true;
    }
  }
}
