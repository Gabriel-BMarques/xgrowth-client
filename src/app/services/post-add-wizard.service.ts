import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IPost, Post } from '@app/shared/models/post.model';
import { DataService } from './data.service';
import { IPostCompany, PostCompany } from '@app/shared/models/post-company.model';
import { ICategoryPost, CategoryPost } from '@app/shared/models/categoryPost.model';
import { Notification } from '@app/shared/models/notification.model';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { MailService } from '@app/services/mail.service';
import * as _ from 'lodash';
import { environment } from '@env/environment';
import { NotificationService } from './notification.service';
import { UserInfoService } from './user-info.service';

@Injectable({
  providedIn: 'root'
})
export class PostAddWizardService {
  get privacy() {
    return this.step2Form.controls.privacy.value;
  }

  set privacy(privacy: string) {
    this.step2Form.controls.privacy.setValue(privacy);
  }

  get isEditing() {
    return this._isEditing;
  }

  set isEditing(isEditing: any) {
    this._isEditing = isEditing;
  }

  set step1Form(form: any) {
    this._step1Form = form;
  }

  get step1Form() {
    return this._step1Form;
  }

  set step2Form(form: any) {
    this._step2Form = form;
  }

  get step2Form() {
    return this._step2Form;
  }

  get isReseted(): boolean {
    return this._isReseted;
  }

  set isReseted(value: boolean) {
    this._isReseted = value;
  }

  viewChanged = new EventEmitter();
  entity: IPost = new Post();
  entityCopy: IPost = new Post();
  postCompany: IPostCompany = new PostCompany();
  postCompanies: IPostCompany[] = [];
  categoryPosts: ICategoryPost[] = [];
  categoryPost: ICategoryPost = new CategoryPost();
  _isEditing = false;
  userCompany: any;
  postId: string;
  currentCompany: ICompanyProfile;
  isLoadingWizard: boolean = true;
  observableLoading: any;
  organizationId: any;

  private _currentView: any;
  private _step1Form: any;
  private _step2Form: any;
  private _isReseted: any;

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private userInfoService: UserInfoService
  ) {
    this.createForms();
    this._isReseted = true;
    this.observableLoading = new BehaviorSubject<Boolean>(this.isLoadingWizard);
  }

  setDefaultVariables() {
    this.entity.IsDraft = true;
    this.entity.SupplierId = this.currentCompany._id;
    this.entity.IsPublic = true;
    this.entity.Privacy = 'Potential Clients';
    this.step1Form.controls.privacy.setValue('Potential Clients');
    this.step1Form.controls.isPublic.setValue(true);
  }

  loadingChange() {
    this.observableLoading.next(this.isLoadingWizard);
  }

  async loadWizard() {
    this.organizationId = this.userInfoService.storedUserInfo.organization._id;
    this.currentCompany = this.userInfoService.storedUserInfo.company;
    // this.currentCompany = this.userInfoService.storedUserInfo.organization;
    this._isReseted = false;
    this.setMode(this.postId);
    if (this.isEditing) {
      await this.prepareDataToEdit(this.postId);
    } else {
      this.setDefaultVariables();
    }
    this.isLoadingWizard = false;
    this.loadingChange();
  }

  next() {
    if (this._currentView !== 5) {
      this._currentView++;
    }
  }

  back() {
    if (this._currentView !== 0) {
      this._currentView--;
    }
  }

  async submit() {
    this.prepareDataToSubmit();
    this.entity.IsPublished = true;
    this.entity.IsDraft = false;
    await this.dataService
      .update('/post', this.entity)
      .toPromise()
      .then(async res => {
        this.reset();
      });
  }

  async updatePost(entity: IPost) {
    await this.dataService
      .update('/post', entity)
      .toPromise()
      .then(() => {});
  }

  async createPost(entity: IPost) {
    await this.dataService
      .create('/post', entity)
      .toPromise()
      .then(res => {
        console.log(res.body);
        this.entity._id = res.body._id;
        this.postId = res.body._id;
      });
  }

  async saveChanges() {
    this.prepareDataToSubmit();
    if (this.entity._id) {
      await this.updatePost(this.entity);
    } else {
      if (this.entity.Title && this.entity.Description) {
        await this.createPost(this.entity);
      }
    }
  }

  get currentView() {
    return this._currentView;
  }

  set currentView(step: number) {
    this._currentView = step;
  }

  getViewChangedEvent() {
    return this.viewChanged;
  }

  reset() {
    this.currentView = 1;
    this.isEditing = false;
    this.entity = new Post();
    this.entityCopy = this.entity; // WTF ???? NAO PRECISA DISSO
    this.createForms();
    this.setDefaultVariables();
  }

  refreshItems(type: string) {
    switch (type) {
      case 'post-company':
        this.dataService.listAll('/post-company').subscribe(postCompanies => {
          this.postCompanies = postCompanies.body;
          this.postCompanies = this.postCompanies.filter(postCompany => {
            return postCompany.PostId === this.entity._id;
          });
        });
        break;
      case 'category-post':
        this.dataService.listAll('/category-post').subscribe(categoryPosts => {
          this.categoryPosts = categoryPosts.body;
          this.categoryPosts = this.categoryPosts.filter(categoryPost => {
            return categoryPost.postId === this.entity._id;
          });
        });
        break;
      default:
        break;
    }
  }

  prepareDataToSubmit() {
    switch (this.currentView) {
      case 1:
        this.entity.Title = this.step1Form.controls.name.value;
        this.entity.Description = this.step1Form.controls.description.value;
        this.entity.UploadedFiles = this.step1Form.controls.uploadedFiles.value;
        this.entity.Privacy = this.step1Form.controls.privacy.value;
        this.entity.RecipientsCompanyProfileId = this.step1Form.controls.recipientsCompanyProfileId.value;
        this.entity.IsPublic = this.step1Form.controls.isPublic.value;
        break;
      case 2:
        this.entity.Categories = this.step2Form.controls.categories.value;
        break;
      default:
        break;
    }
  }

  public async prepareDataToEdit(postId: string) {
    let post: IPost;
    await this.dataService
      .find('/post', postId)
      .toPromise()
      .then(res => {
        post = res.body;
        this.entity = post;
      });
    this.entityCopy = _.cloneDeep(this.entity);
    this.step1Form.controls.name.setValue(post.Title);
    this.step1Form.controls.description.setValue(post.Description);
    this.step1Form.controls.uploadedFiles.setValue(post.UploadedFiles);
    this.step1Form.controls.isPublic.setValue(post.IsPublic);
    this.step1Form.controls.privacy.setValue(post.Privacy);
    if (post.Privacy === 'Selected Companies') {
      const recipients = post.RecipientsCompanyProfileId.map((company: any) => {
        return company._id;
      });
      this.step1Form.controls.recipientsCompanyProfileId.setValue(recipients);
    }
    this.step2Form.controls.categories.setValue(post.Categories);
  }

  public setMode(id?: string) {
    id ? (this.isEditing = true) : (this.isEditing = false);
  }

  private createForms() {
    this.step1Form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      uploadedFiles: [[], Validators.required],
      isPublic: [Boolean, Validators.required],
      privacy: ['', Validators.required],
      recipientsCompanyProfileId: [[], Validators.required]
    });
    this.step2Form = this.formBuilder.group({
      categories: [[], Validators.required]
    });
  }
}
