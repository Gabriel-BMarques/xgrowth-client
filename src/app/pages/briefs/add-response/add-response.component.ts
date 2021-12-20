import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import { environment } from '@env/environment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IUploadedFile } from '@app/shared/models/uploadedFile.model';
import { ModalController, PopoverController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { ResponseAddWizardService } from '@app/services/response-add-wizard.service';
import { IPost, Post } from '@app/shared/models/post.model';
import { debounceTime } from 'rxjs/operators';
import { FilesService } from '@app/services/files.service';
import { NavigationService } from '@app/services/navigation.service';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { ModalValidationComponent } from '@app/shared/modals/modal-validation/modal-validation.component';
import { UserInfoService } from '@app/services/user-info.service';

declare let woopra: any;

@Component({
  selector: 'app-add-response',
  templateUrl: './add-response.component.html',
  styleUrls: ['./add-response.component.scss']
})
export class AddResponseComponent implements OnInit, IAlertControtllerGuard {
  isLoading: boolean;
  header: string;
  @ViewChild('fileInput')
  fileInput: FileUpload;
  isEditing: boolean;
  response: IPost = new Post();
  responseInfoForm!: FormGroup;
  responseImageFileName: string;
  responseImageBase64: string;
  responseImagesBase64: [];
  images: string[] = [];
  imagesUrls: [];
  selectedImage: string;
  delImagesArray: string[] = [];
  file: IUploadedFile;
  briefId: string;
  files: any[] = [];
  _haveFiles: boolean;
  postId: string;
  mainMessage: string;
  secondaryMessage: string;

  constructor(
    public wizard: ResponseAddWizardService,
    public modalController: ModalController,
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute,
    private fileService: FilesService,
    private navigationService: NavigationService,
    private popover: PopoverController,
    private userInfoService: UserInfoService
  ) {
    this.loadForm();
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

    this.isLoading = true;
    // this.briefId = this.wizard.briefId = this.route.snapshot.params.id;
    if (this.route.snapshot.params.id) {
      let briefResponse;
      await this.dataService
        .find('/post', this.route.snapshot.params.id)
        .toPromise()
        .then(response => {
          briefResponse = response.body;
        })
        .catch(error => {
          if (error.status === 404) {
            this.briefId = this.wizard.briefId = this.route.snapshot.params.id;
          }
        });
      if (briefResponse) {
        // this.wizard.isEditing = true;
        this.wizard.prepareDataToEdit(briefResponse);
      } else {
        // this.wizard.isEditing = false;
      }
      this.loadData();
    } else {
      this.loadData();
    }
    this.isLoading = false;
  }

  ionViewWillEnter() {
    this.userInfoService.refreshUserInfo();
    this.postId = this.route.snapshot.params.id;
    this.wizard.setMode(this.postId);
  }

  ionViewDidEnter() {
    if (environment.production) this.woopraIdentify(this.userInfo), this.woopraTrack(this.userInfo);
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
    woopra.track('add brief response click', {
      author: user.email,
      id: user.email,
      name: user.email,
      company: user.company.companyName,
      department: user.department,
      jobTitle: user.jobTitle,
      topic: 'Add Brief Response Click',
      title: document.title,
      url: window.location.href
    });
  }

  woopraTrackCancel(user: any) {
    woopra.track('cancelled add brief response', {
      author: user.email,
      id: user.email,
      name: user.email,
      company: user.company.companyName,
      department: user.department,
      jobTitle: user.jobTitle,
      topic: 'Cancelled Add Brief Response',
      title: document.title,
      url: window.location.href
    });
  }

  loadForm() {
    this.responseInfoForm = this.wizard.step1Form;
    const interval = setInterval(() => {
      if (document.readyState === 'complete') {
        this.onChanges();
        clearInterval(interval);
      }
    }, 10);
  }

  loadData() {
    this.files = this.responseInfoForm.controls.uploadedFiles.value;
    this.files.length > 0 ? (this.haveFiles = true) : (this.haveFiles = false);
  }

  async upload(event: any) {
    this.fileService.upload(event, this.files, this.fileInput, this.responseInfoForm.controls.uploadedFiles, 'image');
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
    if (this.response.UploadedFiles[i]) {
      this.response.UploadedFiles[i].url = 'https://picsum.photos/id/122/130/160';
      return this.response.UploadedFiles[i].url;
    }
  }

  deleteImageOfArray(request: any) {
    this.selectedImage = request;
    this.files.map((img, index: number = 0) => {
      if (this.selectedImage === img.url) {
        this.delImagesArray.push(this.getBlobName(img.url));
        this.files.splice(index, 1);
        if (this.files.length === 0) {
          this.haveFiles = false;
        }
      }
      index++;
    });
    this.deletePermanently();
  }

  onChanges() {
    this.responseInfoForm.controls.name.valueChanges.pipe(debounceTime(1000)).subscribe(async () => {
      this.wizard.step1Form = this.responseInfoForm;
      await this.wizard.saveChanges();
    });
    this.responseInfoForm.controls.description.valueChanges.pipe(debounceTime(1000)).subscribe(async () => {
      this.wizard.step1Form = this.responseInfoForm;
      await this.wizard.saveChanges();
    });
    this.responseInfoForm.controls.uploadedFiles.valueChanges.pipe(debounceTime(1000)).subscribe(async () => {
      this.wizard.step1Form = this.responseInfoForm;
      await this.wizard.saveChanges();
    });
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

  async openBriefRespValidationModal() {
    const modal = await this.popover.create({
      component: ModalValidationComponent,
      componentProps: { mainMessage: this.mainMessage, secondaryMessage: this.secondaryMessage, textButton: 'Ok' },
      cssClass: 'brief-type-modal'
    });

    modal.present();
  }

  briefRespFormValidation() {
    if (!this.haveFiles) {
      this.mainMessage = "You can't move forward without adding the media.";
      this.secondaryMessage = 'Upload it to proceed.';
      return 1;
    } else if (this.responseInfoForm.controls.name.invalid) {
      this.mainMessage = "You can't move forward without adding the title.";
      this.secondaryMessage = 'Insert it to proceed.';
      return 1;
    } else if (this.responseInfoForm.controls.description.invalid) {
      this.mainMessage = "You can't move forward without adding the description.";
      this.secondaryMessage = 'Insert it to proceed.';
      return 1;
    }
    return 0;
  }

  async next() {
    if (this.briefRespFormValidation()) return this.openBriefRespValidationModal();

    this.wizard.step1Form = this.responseInfoForm;
    this.wizard.next();

    await this.wizard.saveChanges();
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-response/attachments', this.briefId], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-response/attachments', 'edit', this.wizard.entity._id], {
        replaceUrl: true
      });
    }
  }

  async saveEditChanges() {
    this.wizard.step1Form = this.responseInfoForm;
    await this.wizard.saveChanges();
    this.router.navigate(['/briefs/add-response/preview', 'edit', this.wizard.entity._id], {
      replaceUrl: true
    });
  }

  isVideo(type: string) {
    const videoFormats = ['mp4', 'wmv', 'avi', 'mov'];
    if (videoFormats.includes(type)) {
      return true;
    } else {
      return false;
    }
  }
  async cancel() {
    if (environment.production) this.woopraIdentify(this.userInfo), this.woopraTrackCancel(this.userInfo);
    this.response = this.wizard.entityCopy;
    console.log(this.response);
    this.wizard.reset();
    if (this.response._id !== undefined) {
      await this.dataService
        .update('/post', this.response)
        .toPromise()
        .then(() => {});
      this.router.navigate(['/post', 'details', this.response._id], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs'], { replaceUrl: true });
    }
  }

  doReorder(ev: any) {
    // Before complete is called with the items they will remain in the
    // order before the drag

    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. Update the items variable to the
    // new order of items
    this.files = ev.detail.complete(this.files);

    // After complete is called the items will be in the new order
    this.responseInfoForm.controls.uploadedFiles.setValue(this.files);
  }

  canDeactivate() {
    if (this.wizard.isEditing && this.wizard.areFormsTouched()) {
      return this.navigationService.generateAlertBriefResponse(
        'Discard Brief Response?',
        'If you leave the brief response edition now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    } else if (!this.wizard.isEditing && !this.wizard.areFormsPristine()) {
      return this.navigationService.generateAlertBriefResponse(
        'Discard Brief Response?',
        'If you leave the brief response creation now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    } else {
      // bypass guard
      return true;
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
}
