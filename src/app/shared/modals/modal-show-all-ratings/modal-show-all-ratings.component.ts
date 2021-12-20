import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService } from '../../../services/data.service';
import { NotificationService } from '@app/services/notification.service';
import { UserInfoService } from '../../../services/user-info.service';
import { RatingModalComponent } from '../rating-modal/rating-modal.component';
@Component({
  selector: 'app-modal-show-all-ratings',
  templateUrl: './modal-show-all-ratings.component.html',
  styleUrls: ['./modal-show-all-ratings.component.scss']
})
export class ModalShowAllRatingsComponent implements OnInit {
  @Input() post: any;
  @Input() stars: any;
  hasDescriptionTruncated: any = [];
  disableTruncation: any = [];
  isAnswering: any = [];
  answerText: string[] = [];
  user: any;

  constructor(
    public modalController: ModalController,
    private dataService: DataService,
    private notificationService: NotificationService,
    private userInfoService: UserInfoService
  ) {}

  ngOnInit(): void {
    this.user = this.userInfoService.storedUserInfo;
  }

  setStarStyle(star: any) {
    star = star * 100 - 10;
    let styles = {
      display: 'inline-block',
      'background-image': 'linear-gradient(90deg, #f6a117 ' + star + '%,#cecece 0%)',
      'background-size': '100%',
      '-webkit-background-clip': 'text',
      '-webkit-text-fill-color': 'transparent'
    };
    return styles;
  }

  handlerRatingTruncated(res: boolean, index: any) {
    if (!this.hasDescriptionTruncated[index]) this.hasDescriptionTruncated[index] = res;
  }

  async sendAnswer(ratingIndex: number) {
    let entity = this.post.ratings[ratingIndex];

    entity.post = this.post._id;
    entity.answer = {
      message: this.answerText[ratingIndex],
      organization: this.post.organization,
      createdBy: this.post.CreatedBy._id
    };

    await this.dataService
      .update('/post-rating', entity)
      .toPromise()
      .then(res => {
        this.isAnswering[ratingIndex] = !this.isAnswering[ratingIndex];
        this.user = res.body.user;

        let post = {
          id: this.post._id,
          postTitle: this.post.Title,
          commentPreview: this.answerText[ratingIndex].slice(0, 50)
        };

        this.notificationService.sendPostRatingAnsweredNotification(this.user, post);
      });
  }

  async openRatePostModal() {
    const modal = this.modalController.create({
      component: RatingModalComponent,
      cssClass: 'modal-post-page',
      componentProps: {
        postId: this.post._id
      }
    });

    (await modal).present();
  }

  back() {
    this.modalController.dismiss();
  }

  canViewAnswer(rating: any) {
    if (this.user) {
      if (this.user._id == this.post.CreatedBy._id || this.user._id == rating.user) return true;
      return false;
    }
  }
}
