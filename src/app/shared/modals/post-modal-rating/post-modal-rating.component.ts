import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MediaService } from '../../../services/media.service';
import { DataService } from '../../../services/data.service';
import { UserInfoService } from '../../../services/user-info.service';
import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ICountry } from '@app/shared/models/country.model';
import { ModalController } from '@ionic/angular';
const videoFormats = ['mp4', 'wmv', 'avi', 'mov'];

@Component({
  selector: 'app-post-modal-rating',
  templateUrl: './post-modal-rating.component.html',
  styleUrls: ['./post-modal-rating.component.scss']
})
export class PostModalRatingComponent implements OnInit {
  @Input() postId: any;

  ratingForm: FormGroup;
  entity: any;
  user: any;
  company: any;
  isLoading = true;
  rating = 0;

  constructor(
    private modalController: ModalController,
    private userInfoService: UserInfoService,
    private dataService: DataService,
    private mediaService: MediaService,
    private formBuilder: FormBuilder
  ) {}

  async ngOnInit() {
    // await this.loadUserData();
    // await this.loadPostData();
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

  setRating(rating: number) {
    this.rating = rating;
  }

  hoverIn(rating: number) {
    this.rating = rating;
  }

  hoverOut() {
    this.rating = 0;
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
