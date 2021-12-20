import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';
import { IBrief, Brief } from '@app/shared/models/brief.model';
import { DataService } from './data.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from './notification.service';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BriefAddWizardService {
  get images() {
    return this._images;
  }

  set images(images: any[]) {
    this._images = images;
  }

  get briefType() {
    return this._briefType;
  }

  set briefType(type: string) {
    this._briefType = type;
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

  get step2Form() {
    return this._step2Form;
  }

  set step2Form(form: any) {
    this._step2Form = form;
  }

  get step3Form() {
    return this._step3Form;
  }

  set step3Form(form: any) {
    this._step3Form = form;
  }

  get step4Form() {
    return this._step4Form;
  }

  set step4Form(form: any) {
    this._step4Form = form;
  }

  get step5Form() {
    return this._step5Form;
  }

  set step5Form(form: any) {
    this._step5Form = form;
  }

  get step6Form() {
    return this._step6Form;
  }

  set step6Form(form: any) {
    this._step6Form = form;
  }

  get step7Form() {
    return this._step7Form;
  }

  set step7Form(form: any) {
    this._step7Form = form;
  }

  get step8Form() {
    return this._step8Form;
  }

  set step8Form(form: any) {
    this._step8Form = form;
  }

  get isReseted(): boolean {
    return this._isReseted;
  }

  set isReseted(value: boolean) {
    this._isReseted = value;
  }

  get briefChanges(): string[] {
    const changes = _.reduce(
      this.entityCopy,
      (result, value, key) => {
        return _.isEqual(value, this.entity[key]) ? result : result.concat(key);
      },
      []
    );
    if (this.entity.Attachments.length <= this.entityCopy.Attachments.length) {
      const index = changes.indexOf('Attachments');
      const found = index !== -1;
      if (found) {
        changes.splice(index, 1);
      }
    }
    return changes;
  }

  currentView = 1;

  viewChanged = new EventEmitter();
  entity: IBrief = new Brief();
  entityCopy: IBrief = new Brief();
  fileNames: any[] = [];
  _isEditing = false;
  _currentBriefMember: any;
  observableLoading: any;
  isLoadingWizard: boolean = true;

  private _step1Form: any;
  private _step2Form: any;
  private _step3Form: any;
  private _step4Form: any;
  private _step5Form: any;
  private _step6Form: any;
  private _step7Form: any;
  private _step8Form: any;
  private _briefType: any;
  private _isReseted: any;
  private _images: string[] = [];

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.createForms();
    this._isReseted = true;
    this.observableLoading = new BehaviorSubject<Boolean>(this.isLoadingWizard);
  }

  loadingChange() {
    this.observableLoading.next(this.isLoadingWizard);
  }

  next() {
    if (this.currentView !== 8) {
      this.currentView++;
    }
  }

  back() {
    if (this.currentView !== 0) {
      this.currentView--;
    }
  }

  public setMode(id?: string) {
    id ? (this.isEditing = true) : (this.isEditing = false);
  }

  async loadWizard() {
    this._isReseted = false;
    this.setMode(this.entity._id);
    if (this.isEditing) {
      await this.prepareDataToEdit(this.entity);
    }
    this.isLoadingWizard = false;
    this.loadingChange();
  }

  async submit() {
    this.prepareDataToSubmit();
    const wasDraft = this.entity.IsDraft;
    this.entity.IsDraft = false;
    this.dataService.update('/brief', this.entity).subscribe(res => {
      if (!this.isEditing || wasDraft) {
        this.sendNotifications();
      }
    });
  }

  async sendNotifications() {
    const solvers = this.step7Form.controls.briefSuppliers.value.map((briefSupplier: any) => {
      return briefSupplier.SupplierId;
    });
    this.notificationService.sendNewBriefNotifications(solvers, this.entity, false);
    this.reset();
  }

  async saveChanges(finish?: boolean) {
    if (this.entity._id) {
      this.dataService.find('/brief', this.entity._id).subscribe(foundBrief => {
        this.entity = foundBrief.body;
        this.prepareDataToSubmit();
        this.dataService.update('/brief', this.entity).subscribe(() => {
          if (finish) {
            this.notificationService.sendBriefChangesNotification(this.briefChanges, this.entity);
            this.reset();
          }
        });
      });
    } else {
      this.prepareDataToSubmit();
      if (this.entity.Title && this.entity.Description) {
        await this.dataService
          .getUserCompany()
          .toPromise()
          .then(async company => {
            this.entity.ClientId = company.body._id;
            await this.dataService
              .create('/brief', this.entity)
              .toPromise()
              .then(res => {
                this.entity.CreatedBy = res.body.CreatedBy;
                this.entity._id = res.body._id;
              });
          });
      }
    }
  }

  public async prepareDataToEdit(brief: IBrief) {
    if (brief.Categories === undefined) {
      // let briefInfo: IBrief;
      await this.dataService
        .find('/brief', brief._id)
        .toPromise()
        .then(res => {
          brief = res.body;
          this.entity = brief;
        });
    }

    this.entity = brief;
    this.entityCopy = _.cloneDeep(this.entity);
    // Populating step 1 form
    this.step1Form.controls.name.setValue(brief.Title);
    this.step1Form.controls.description.setValue(brief.Description);
    this.step1Form.controls.uploadedFiles.setValue(brief.UploadedFiles);

    // Populating step 2 form
    this.step2Form.controls.attachments.setValue(brief.Attachments);

    // Populating step 3 form
    this.step3Form.controls.companies.setValue(brief.Companies);
    this.step3Form.controls.countries.setValue(brief.Markets);

    // Populating step 4 form
    this.step4Form.controls.categories.setValue(brief.Categories);

    // Populating step 5 form
    await this.dataService
      .listById('/brief-member', brief._id)
      .toPromise()
      .then(briefMembers => {
        this.step5Form.controls.teamMembers.setValue(briefMembers.body);
      });

    // Populating step 6 form
    await this.dataService
      .listById('/brief-supplier', brief._id)
      .toPromise()
      .then(briefSuppliers => {
        const solvers = briefSuppliers.body.map(briefSupplier => {
          return briefSupplier.SupplierId;
        });
        this.step6Form.controls.solvers.setValue(solvers);
      });

    // Populating step 8 form
    this.step8Form.controls.isPublished.setValue(brief.IsPublished);
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
    this.briefType = undefined;
    this._currentBriefMember = undefined;
    this.entity = new Brief();
    this.entityCopy = _.cloneDeep(this.entity);
    this.createForms();
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
      case 'step3Form':
        formControls.companies.setValue([]);
        formControls.countries.setValue([]);
        break;
      case 'step4Form':
        formControls.categories.setValue([]);
        break;
      case 'step5Form':
        formControls.teamMembers.setValue([]);
        break;
      case 'step6Form':
        formControls.solvers.setValue([]);
        break;
      case 'step8Form':
        formControls.isPublished.setValue('');
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
      case 3:
        if (this.step3Form.controls.companies.value.length > 0) {
          this.entity.Companies = this.step3Form.controls.companies.value.map((company: any) => {
            return company._id;
          });
        }
        if (this.step3Form.controls.countries.value.length > 0) {
          this.entity.Markets = this.step3Form.controls.countries.value.map((country: any) => {
            return country._id;
          });
        }
        break;
      case 4:
        if (this.step4Form.controls.categories.value.length > 0) {
          this.entity.Categories = this.step4Form.controls.categories.value.map((category: any) => {
            return category._id;
          });
        }
        break;
      case 8:
        this.entity.IsPublished = this.step8Form.controls.isPublished.value;
        break;
      default:
        break;
    }
  }

  public areFormsTouched() {
    return (
      this.step1Form.touched ||
      this.step2Form.touched ||
      this.step3Form.touched ||
      this.step4Form.touched ||
      this.step5Form.touched ||
      this.step6Form.touched ||
      this.step8Form.touched
    );
  }

  public areFormsPristine() {
    return (
      this.step1Form.pristine ||
      this.step2Form.pristine ||
      this.step3Form.pristine ||
      this.step4Form.pristine ||
      this.step5Form.pristine ||
      this.step6Form.pristine ||
      this.step8Form.pristine
    );
  }

  public createForms() {
    this.step1Form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      uploadedFiles: [[], Validators.required]
    });
    this.step2Form = this.formBuilder.group({
      attachments: [[], Validators.required]
    });
    this.step3Form = this.formBuilder.group({
      companies: [[], Validators.required],
      countries: [[], Validators.required]
    });
    this.step4Form = this.formBuilder.group({
      categories: [[], Validators.required]
    });
    this.step5Form = this.formBuilder.group({
      teamMembers: [[], Validators.required]
    });
    this.step6Form = this.formBuilder.group({
      solvers: [[], Validators.required]
    });
    this.step8Form = this.formBuilder.group({
      isPublished: ['', Validators.required]
    });
  }
}
