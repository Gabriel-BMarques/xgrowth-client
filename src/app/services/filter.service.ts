import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { IPost, Post } from '@app/shared/models/post.model';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  get images() {
    return this._images;
  }

  set images(images: any[]) {
    this._images = images;
  }

  get isEditing() {
    return this._isEditing;
  }

  set isEditing(isEditing: any) {
    this._isEditing = isEditing;
  }

  set feedRegions(filters: any) {
    this._feedRegions = filters;
  }

  get feedRegions() {
    return this._feedRegions;
  }

  set feedCategories(filters: any) {
    this._feedCategories = filters;
  }

  get feedCategories() {
    return this._feedCategories;
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

  set step4Form(form: any) {
    this._step4Form = form;
  }

  get step4Form() {
    return this._step4Form;
  }

  set step5Form(form: any) {
    this._step5Form = form;
  }

  get step5Form() {
    return this._step5Form;
  }

  currentView = 1;

  viewChanged = new EventEmitter();
  entity: any;
  _isEditing = false;

  private _feedRegions: any;
  private _feedCategories: any;
  private _step2Form: any;
  private _step3Form: any;
  private _step4Form: any;
  private _step5Form: any;
  private _images: string[] = [];

  constructor(private dataService: DataService) {}

  next() {
    if (this.currentView !== 5) {
      this.currentView++;
    }
  }

  back() {
    if (this.currentView !== 0) {
      this.currentView--;
    }
  }

  submit() {
    this.prepareDataToSubmit();
    if (this.entity._id) {
      this.dataService.update('/post', this.entity).subscribe(() => {});
    } else {
      this.dataService.create('/post', this.entity).subscribe(() => {});
    }
  }

  saveChanges() {
    if (this.entity._id) {
      this.dataService.find('/post', this.entity._id).subscribe(foundPost => {
        this.entity = foundPost.body;
        this.prepareDataToSubmit();
        this.dataService.update('/post', this.entity).subscribe(newPost => {});
      });
    } else {
      this.prepareDataToSubmit();
      this.dataService.create('/post', this.entity).subscribe(res => {
        this.entity._id = res.body._id;
      });
    }
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
    this.entity = undefined;
    this._feedRegions = undefined;
    this._feedCategories = undefined;
    this._step2Form = undefined;
    this._step3Form = undefined;
    this._step4Form = undefined;
    this._step5Form = undefined;
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
    this.entity.IsDraft = true;
    if (this.step2Form) {
      this.entity.RecipientsCompanyProfileId = this.step2Form.controls.recipientsCompanyProfileId.value;
    }
    if (this.step3Form) {
      this.entity.Tags = this.step3Form.controls.tags.value;
    }
    if (this.step4Form) {
      this.entity.Categories = this.step4Form.controls.categories.value;
      if (this.step4Form.controls.recipientsCompanyProfileId) {
        this.entity.RecipientsCompanyProfileId = this.step4Form.controls.recipientsCompanyProfileId.value;
      }
    }
    if (this.step5Form) {
      this.entity.IsPublished = this.step5Form.controls.isPublished.value;
    }
  }
}
