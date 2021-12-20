import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';
import { IResponse, Response } from '@app/shared/models/response.model';
import { DataService } from './data.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IPost, Post } from '@app/shared/models/post.model';
import { ActivatedRoute } from '@angular/router';
import { MailService } from './mail.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ResponseAddWizardService {
  get images() {
    return this._images;
  }

  set images(images: any[]) {
    this._images = images;
  }

  get briefId() {
    return this._briefId;
  }

  set briefId(id: string) {
    this._briefId = id;
  }

  get isEditing() {
    return this._isEditing;
  }

  set isEditing(isEditing: any) {
    this._isEditing = isEditing;
  }

  get step1Form() {
    return this._step1Form;
  }

  set step1Form(form: any) {
    this._step1Form = form;
  }

  set step2Form(form: any) {
    this._step2Form = form;
  }

  get step2Form() {
    return this._step2Form;
  }

  set step3Form(form: any) {
    this._step3Form = form;
  }

  get step3Form() {
    return this._step3Form;
  }

  currentView = 1;

  viewChanged = new EventEmitter();
  entity: IPost = new Post();
  entityCopy: IPost = new Post();
  _isEditing = false;
  _briefId: string;
  fileNames: string[] = [];
  postId: string;

  private _step1Form: any;
  private _step2Form: any;
  private _step3Form: any;
  private _images: string[] = [];

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private mailService: MailService,
    private notificationService: NotificationService
  ) {
    this.createForms();
  }

  next() {
    if (this.currentView !== 3) {
      this.currentView++;
    }
  }

  back() {
    if (this.currentView !== 0) {
      this.currentView--;
    }
  }

  setMode(id: string) {
    if (id) {
      this.isEditing = true;
    } else {
      this.isEditing = false;
    }
  }

  async submit() {
    this.prepareDataToSubmit();
    this.entity.IsDraft = false;
    if (this.entity._id) {
      // Problem: if notification it's not delivered error 500 ???
      if (!this.entity.IsPublished && !this.entity.IsDraft) {
        console.log(this.entity.IsPublished);
        console.log(this.entity.IsDraft);
        await this.createBriefResponseNotifications(this.entity);
      }
      this.entity.IsPublished = true;

      this.dataService.update('/post', this.entity).subscribe(() => {
        setTimeout(() => {
          this.reset();
          this.createForms();
        }, 1000);
      });
    } else {
      this.entity.IsPublished = true;
      this.dataService.create('/post', this.entity).subscribe(() => {
        setTimeout(() => {
          this.reset();
          this.createForms();
        }, 1000);
      });
    }
  }

  async createBriefResponseNotifications(entity: any) {
    console.log(entity);
    await this.notificationService.sendBriefResponseNotification(entity);
  }

  async saveChanges(next?: boolean) {
    if (this.entity._id) {
      await this.dataService
        .find('/post', this.entity._id)
        .toPromise()
        .then(foundResponse => {
          this.entity = foundResponse.body;
          this.prepareDataToSubmit();
        });
      await this.dataService
        .update('/post', this.entity)
        .toPromise()
        .then(newResponse => {
          if (next) {
            this.next();
          }
        });
    } else {
      console.log('BATEU AQUI');
      this.entity.BriefId = this.briefId;
      this.prepareDataToSubmit();
      await this.dataService
        .create('/post', this.entity)
        .toPromise()
        .then(res => {
          this.entity._id = res.body._id;
          if (next) {
            this.next();
          }
        });
    }
  }

  prepareDataToEdit(response: IPost): void {
    this.entity = this.entityCopy = response;

    this.step1Form.controls.name.setValue(response.Title);
    this.step1Form.controls.description.setValue(response.Description);
    this.step1Form.controls.uploadedFiles.setValue(response.UploadedFiles);

    this.step2Form.controls.attachments.setValue(response.Attachments);
  }

  getCurrentView() {
    return this.currentView;
  }

  getViewChangedEvent() {
    return this.viewChanged;
  }

  reset() {
    this.currentView = 1;
    this.isEditing = false;
    this.entity = new Post();
    this.entityCopy = this.entity;
    this.createForms();
    // this.clearForm(this.step1Form.controls, 'step1Form');
    // this.clearForm(this.step2Form.controls, 'step2Form');
  }

  clearForm(formControls: any, formName: string) {
    switch (formName) {
      case 'step1Form':
        formControls.name.setValue('');
        formControls.description.setValue('');
        formControls.uploadedFiles.setValue([]);
        break;
      case 'step2Form':
        formControls.attachments.setValue([]);
        break;
      default:
        break;
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    (Object as any).values(formGroup.controls).forEach((control: FormGroup) => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  prepareDataToSubmit() {
    if (!this.entity.IsPublished) {
      this.entity.IsDraft = true;
    }
    switch (this.currentView) {
      case 1:
        this.entity.Title = this.step1Form.controls.name.value;
        this.entity.Description = this.step1Form.controls.description.value;
        this.entity.UploadedFiles = this.step1Form.controls.uploadedFiles.value;
        break;
      case 2:
        this.entity.Attachments = this.step2Form.controls.attachments.value;
        break;
      default:
        break;
    }
  }

  public areFormsTouched(): boolean {
    return this.step1Form.touched || this.step2Form.touched;
  }

  public areFormsDirty(): boolean {
    return this.step1Form.dirty || this.step2Form.dirty;
  }

  public areFormsPristine(): boolean {
    return this.step1Form.pristine || this.step2Form.pristine;
  }

  private createForms() {
    this.step1Form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      uploadedFiles: [[], Validators.required]
    });
    this.step2Form = this.formBuilder.group({
      attachments: [[], Validators.required]
    });
  }
}
