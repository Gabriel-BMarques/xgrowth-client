import { Component, ViewChild } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import { FormGroup } from '@angular/forms';
import { IUploadedFile } from '@app/shared/models/uploadedFile.model';
import { HeaderService } from '@app/services/header.service';
import { ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';
import { FilesService } from '@app/services/files.service';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { NavigationService } from '@app/services/navigation.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent implements IAlertControtllerGuard {
  isLoading = false;
  header: string;
  @ViewChild('fileInput')
  fileInput: FileUpload;
  isEditing: boolean;
  attachmentForm: FormGroup;
  attachments: any[] = [];
  selectedImage: string;
  delAttachmentsArray: string[] = [];
  file: IUploadedFile;
  fileNames: any[] = [];
  files: any[] = [];

  get briefId(): string {
    return this.wizard.entity._id;
  }

  constructor(
    private headerService: HeaderService,
    public wizard: BriefAddWizardService,
    public modalController: ModalController,
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private fileService: FilesService,
    private navigationService: NavigationService
  ) {
    this.setHeaderLang();
    this.headerService.setHeader(this.header);
  }

  async ionViewWillEnter() {
    this.wizard.currentView = 2;
    await this.checkWizardReset();
    await this.loadData();
    this.isLoading = false;
  }

  async checkWizardReset() {
    if (this.wizard.isReseted) await this.resetBriefCreation();
  }

  async resetBriefCreation() {
    const briefId = this.route.snapshot.params.id;
    if (!briefId) this.router.navigate(['/briefs/add-brief/basic-info'], { replaceUrl: true });
    else this.wizard.entity._id = briefId;
    await this.wizard.loadWizard();
  }

  setHeaderLang() {
    if (localStorage.getItem('language') === 'en=US') {
      this.header = 'Add Attachments';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Adicionar Arquivos';
    }
  }

  async loadData() {
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
        this.attachmentForm.controls.attachments.setValue(this.files);
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
      this.wizard.step2Form = _.cloneDeep(this.attachmentForm);
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

  saveEditChanges() {
    this.wizard.step1Form = _.cloneDeep(this.attachmentForm);
    const finish = true;
    this.wizard.saveChanges(finish);
    this.router.navigate(['briefs', 'my-brief', this.wizard.entity._id], { replaceUrl: true });
  }

  next() {
    this.wizard.step2Form = _.cloneDeep(this.attachmentForm);
    this.wizard.saveChanges();
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/market-info'], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/market-info', 'edit', this.wizard.entity._id], { replaceUrl: true });
    }
  }

  back() {
    this.wizard.back();
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief'], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief', 'edit', this.wizard.entity._id], { replaceUrl: true });
    }
  }
  canDeactivate() {
    if (this.wizard.isEditing) {
      return this.navigationService.generateAlertBrief(
        'Discard Brief?',
        'If you leave the brief edition now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    } else {
      return this.navigationService.generateAlertBrief(
        'Discard Brief?',
        'If you leave the brief creation now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    }
  }
}
