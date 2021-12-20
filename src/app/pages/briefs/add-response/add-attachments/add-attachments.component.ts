import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import { IResponse, Response } from '@app/shared/models/response.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IUploadedFile } from '@app/shared/models/uploadedFile.model';
import { HeaderService } from '@app/services/header.service';
import { PostAddWizardService } from '@app/services/post-add-wizard.service';
import { ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { ResponseAddWizardService } from '@app/services/response-add-wizard.service';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';
import { IBrief } from '@app/shared/models/brief.model';
import * as _ from 'lodash';
import { FilesService } from '@app/services/files.service';
import { NavigationService } from '@app/services/navigation.service';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';

@Component({
  selector: 'app-add-attachments',
  templateUrl: './add-attachments.component.html',
  styleUrls: ['./add-attachments.component.scss']
})
export class AddAttachmentsComponent implements OnInit, IAlertControtllerGuard {
  isLoading = false;
  header: string;
  @ViewChild('fileInput')
  fileInput: FileUpload;
  isEditing: boolean;
  responseImageFileName: string;
  responseImageBase64: string;
  responseImagesBase64: [];
  attachmentForm: FormGroup;
  attachments: any[] = [];
  attachmentsUrls: [];
  selectedImage: string;
  delAttachmentsArray: string[] = [];
  file: IUploadedFile;
  briefId: string;
  fileNames: any[] = [];
  files: any[] = [];
  _haveFiles: boolean;

  constructor(
    private headerService: HeaderService,
    private formBuilder: FormBuilder,
    public wizard: ResponseAddWizardService,
    public modalController: ModalController,
    private router: Router,
    private dataService: DataService,
    private el: ElementRef,
    private route: ActivatedRoute,
    private fileService: FilesService,
    private navigationService: NavigationService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.verifyHeaderLang();
    this.headerService.setHeader(this.header);
    this.loadData();
    this.isLoading = false;
    this.wizard.entity._id
      ? (this.briefId = this.wizard.entity._id)
      : this.route.snapshot.params.id
      ? (this.briefId = this.route.snapshot.params.id)
      : (this.briefId = undefined);

    this.isEditing = this.wizard.isEditing;
  }

  ionViewWillEnter() {}

  ionViewDidEnter() {}

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en=US') {
      this.header = 'Add Attachments';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Adicionar Arquivos';
    }
  }

  loadData() {
    this.attachmentForm = _.cloneDeep(this.wizard.step2Form);
    this.files = this.wizard.step2Form.controls.attachments.value;
    this.onChanges();
  }

  upload(event: any) {
    this.fileService.upload(event, this.files, this.fileInput, this.attachmentForm.controls.attachments, 'attachment');
  }

  getThumbnailAttachment(url: string) {
    const attachment = 'https://weleverimages.blob.core.windows.net/app-images/' + url;
    return attachment;
  }

  deleteAttachmentOfArray(request: any) {
    this.selectedImage = request;
    this.files.map((img, index: number = 0) => {
      if (this.selectedImage === img.url) {
        this.delAttachmentsArray.push(this.getBlobName(img.url));
        this.files.splice(index, 1);
      }
      index++;
    });
    this.deletePermanently();
  }

  getBlobName(url: string) {
    const blobName = url.split('https://weleverimages.blob.core.windows.net/app-images/').pop();
    return blobName;
  }

  onChanges(): void {
    this.attachmentForm.valueChanges.subscribe(() => {
      this.wizard.step2Form = this.attachmentForm;
      this.wizard.saveChanges();
    });
  }

  delArraySize() {
    return this.delArraySize.length;
  }

  deletePermanently() {
    this.dataService
      .deleteFile('/upload', this.delAttachmentsArray)
      .toPromise()
      .then(res => {
        res.body.map((index: number = 0) => {
          res.body.push(this.delAttachmentsArray[index]);
          index++;
        });
      });
  }

  next() {
    this.wizard.step2Form = this.attachmentForm;
    this.wizard.next();
    this.wizard.saveChanges(true);
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-response/terms', this.briefId], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-response/terms', 'edit', this.wizard.entity._id], {
        replaceUrl: true
      });
    }
  }

  saveEditChanges() {
    this.wizard.step2Form = this.attachmentForm;
    this.wizard.saveChanges();
    this.router.navigate(['/briefs/add-response/preview', 'edit', this.wizard.entity._id], {
      replaceUrl: true
    });
  }

  back() {
    this.wizard.back();
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-response', this.briefId], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-response', 'edit', this.wizard.entity._id], { replaceUrl: true });
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
}
