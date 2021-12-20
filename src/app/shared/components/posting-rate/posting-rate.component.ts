import { Router } from '@angular/router';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalShowAllRatingsComponent } from '../../modals/modal-show-all-ratings/modal-show-all-ratings.component';
import { DataService } from '../../../services/data.service';
import { NotificationService } from '@app/services/notification.service';
import { UserInfoService } from '../../../services/user-info.service';
import { RatingModalComponent } from '../../modals/rating-modal/rating-modal.component';

@Component({
  selector: 'app-posting-rate',
  templateUrl: './posting-rate.component.html',
  styleUrls: ['./posting-rate.component.scss']
})
export class PostingRateComponent implements OnInit, AfterViewInit {
  @Input() post: any;
  @Output() onPostRate = new EventEmitter();
  hasDescriptionTruncated: any = [false, false];
  disableTruncation: any = [false, false];
  isAnswering: any = [false, false];
  stars: any;
  answerText: string[] = [];
  user: any;

  constructor(
    public modalController: ModalController,
    private dataService: DataService,
    private notificationService: NotificationService,
    private userInfoService: UserInfoService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.loadRatingsData();
    this.loadUserData();
  }

  trackByIndex(index: number, obj: any): any {
    return index;
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

  async goToProfile(organization: any) {
    console.log(organization);
    if (!organization.restricted)
      this.router.navigate([`organization/${organization._id}/overview`], { replaceUrl: true });
  }

  loadRatingsData(): void {
    let postRatingAverageAux = parseInt(this.post.PostRatingAverage);
    postRatingAverageAux = Math.floor(postRatingAverageAux);
    let decimalPart = this.post.PostRatingAverage - postRatingAverageAux;

    // Preenche com 1 as posições que tem estrela e 0 as que não tem [1,1,1,0,0] = 3 estrelas
    this.stars = Array(postRatingAverageAux).fill(1);
    this.stars = this.stars.concat(Array(5 - parseInt(this.post.PostRatingAverage)).fill(0));

    // Insere a parte decimal na posição correta [1,1,1, 0.5, 0] = 3.5 estrelas
    if (decimalPart) this.stars[Math.ceil(parseInt(this.post.PostRatingAverage))] = decimalPart;

    // Array de 5 posições/estrelas [1,1,1,0,0] = 3 estrelas
    this.post.ratings?.map((comment: any) => {
      comment.stars = Array(parseInt(comment.rate)).fill(1);
      comment.stars = comment.stars.concat(Array(5 - parseInt(comment.rate)).fill(0));
    });

    this.post.PostRatingAverage = parseFloat(this.post.PostRatingAverage).toFixed(1);
  }

  handlerRatingTruncated(res: boolean, index: any) {
    if (!this.hasDescriptionTruncated[index]) this.hasDescriptionTruncated[index] = res;
  }

  async showAllRatings() {
    const modal = await this.modalController.create({
      component: ModalShowAllRatingsComponent,
      cssClass: 'modal-post-page',
      componentProps: {
        post: this.post,
        stars: this.stars
      }
    });
    modal.present();
  }

  async loadUserData() {
    this.user = this.userInfoService.storedUserInfo;
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
    (await modal).onDidDismiss().then(() => {
      this.onPostRate.emit();
    });
  }

  canViewAnswer(rating: any) {
    if (this.user) {
      if (this.user._id == this.post.CreatedBy._id || this.user._id == rating.user) return true;
      return false;
    }
  }
}
