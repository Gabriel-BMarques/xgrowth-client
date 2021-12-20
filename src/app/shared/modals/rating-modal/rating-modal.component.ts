import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MediaService } from '../../../services/media.service';
import { DataService } from '../../../services/data.service';
import { UserInfoService } from '../../../services/user-info.service';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
const videoFormats = ['mp4', 'wmv', 'avi', 'mov'];
import { NotificationService } from '@app/services/notification.service';
import * as ratingsReasons from '@app/shared/json-files/ratings-reasons.json';

@Component({
  selector: 'app-rating-modal',
  templateUrl: './rating-modal.component.html',
  styleUrls: ['./rating-modal.component.scss']
})
export class RatingModalComponent implements OnInit {
  @Input() postId: any;
  @Input() ratingIn: number;
  @ViewChild('text') text: any;

  ratingForm: FormGroup;
  entity: any;
  user: any;
  company: any;
  isLoading = true;
  rating = 0;
  savedRating = 0;
  reasons: any[] = ratingsReasons.default;

  constructor(
    private modalController: ModalController,
    private userInfoService: UserInfoService,
    private dataService: DataService,
    private mediaService: MediaService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.createRatingForm();
  }

  filterReasons() {
    return this.reasons.filter(reason => {
      return reason.range.includes(this.savedRating);
    });
  }

  setRating(rating: number) {
    this.rating = rating;
    this.savedRating = rating;
    this.ratingForm.controls.reason.reset();
  }

  hoverIn(rating: number) {
    this.rating = rating;
  }

  hoverOut() {
    this.rating = this.savedRating;
  }

  getMediaTypes(entity: any) {
    entity.UploadedFiles.map((file: any) => {
      if (videoFormats.includes(file.Type)) {
        file.isVideo = true;
        file.isImage = false;
      } else {
        file.isVideo = false;
        file.isImage = true;
      }
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  inputEmpty(control: FormControl): boolean {
    return control.value === undefined || control.value === '' || control.value === null;
  }

  //verifies the maxLength of the comment section
  isMaxLength(control: FormControl): boolean {
    return control.value.length === 1500;
  }

  capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  setCommentAsRequired() {
    this.ratingForm.controls.comment.setValidators([Validators.required]);
    this.ratingForm.controls.comment.updateValueAndValidity();
  }

  setCommentAsOptional() {
    this.ratingForm.controls.comment.clearValidators();
    this.ratingForm.controls.comment.updateValueAndValidity();
  }

  checkSelectedReason(value: string) {
    if (value?.trim().toLocaleLowerCase() === 'other') this.setCommentAsRequired();
    else this.setCommentAsOptional();
  }

  async ngOnInit() {
    await this.loadUserData();
    await this.loadPostData();
    if (this.ratingIn) this.rating = this.savedRating = this.ratingIn;
    this.isLoading = false;
  }

  async loadUserData() {
    await this.userInfoService.refreshUserInfo();
    this.user = this.userInfoService.storedUserInfo;
  }

  async loadPostData() {
    this.entity = (await this.dataService.find('/post', this.postId).toPromise()).body;
    if (this.entity) {
      this.mediaService.getMediaTypes(this.entity);
      if (this.entity.SupplierId) {
        this.company = this.entity.SupplierId;
      } else {
        this.company = this.entity.ClientId;
      }
    }
  }

  async submitRating() {
    await this.dataService
      .create('/post-rating', this.prepareRatingToSubmit())
      .toPromise()
      .then((res: any) => {
        this.user = this.entity.CreatedBy;

        let post = {
          id: this.postId,
          postTitle: this.entity.Title,
          commentPreview: this.ratingForm.controls.comment.value.slice(0, 50),
          organizationName: res.body.organization,
          reason: this.ratingForm.controls.reason.value
        };

        this.notificationService.sendNewPostRatingNotification(this.user, post);

        this.dismiss();
      });
  }

  private createRatingForm() {
    this.ratingForm = this.formBuilder.group({
      reason: ['', Validators.required],
      comment: ['', Validators.maxLength(1499)]
    });

    this.ratingForm.controls.reason.valueChanges.subscribe((value: string) => this.checkSelectedReason(value));
  }

  private prepareRatingToSubmit() {
    const entity: any = {};
    entity.rate = this.savedRating;
    entity.reason = this.capitalizeFirstLetter(this.ratingForm.controls.reason.value);
    entity.comment = this.capitalizeFirstLetter(this.ratingForm.controls.comment.value);
    entity.post = this.postId;
    return entity;
  }

  get disableSubmitButton(): boolean {
    return this.savedRating === 0 || this.ratingForm.invalid;
  }
}
