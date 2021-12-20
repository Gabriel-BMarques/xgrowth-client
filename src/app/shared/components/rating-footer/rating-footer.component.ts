import { RatingModalComponent } from '../../modals/rating-modal/rating-modal.component';
import { ContactModalComponent } from '../../modals/contact-modal/contact-modal.component';
import { AddCollectionComponent } from '../../../pages/collections/my-collections/add-collection/add-collection.component';
import { ICollection } from '../../models/collections.model';
import { CollectionModalComponent } from '../../../pages/post/collection-modal/collection-modal.component';
import { Router } from '@angular/router';
import { Component, Input, OnInit, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-rating-footer',
  templateUrl: './rating-footer.component.html',
  styleUrls: ['./rating-footer.component.scss']
})
export class RatingFooterComponent implements OnInit, AfterViewInit {
  @Input() entity: any;
  @Output() onPostRate = new EventEmitter();
  stars: any;
  rating = 0;
  pins: number;
  user: any;
  collections: ICollection[];
  currentModal: any;

  get saveText(): string {
    if (this.entity.BriefId) return 'Save response';
    else return 'Save post';
  }

  constructor(
    public modalController: ModalController,
    private popoverController: PopoverController,
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.refreshCollectionsData();
    this.loadRatingsData();
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

  setRating(rating: number) {
    this.rating = rating;
  }

  hoverIn(rating: number) {
    this.rating = rating;
  }

  hoverOut() {
    this.rating = 0;
  }

  share() {
    this.router.navigate(['/post/share', this.entity._id], { replaceUrl: true });
  }

  loadRatingsData(): void {
    let postRatingAverageAux = parseInt(this.entity.PostRatingAverage);
    postRatingAverageAux = Math.floor(postRatingAverageAux);
    let decimalPart = this.entity.PostRatingAverage - postRatingAverageAux;

    // Preenche com 1 as posições que tem estrela e 0 as que não tem [1,1,1,0,0] = 3 estrelas
    this.stars = Array(postRatingAverageAux).fill(1);
    this.stars = this.stars.concat(Array(5 - parseInt(this.entity.PostRatingAverage)).fill(0));

    // Insere a parte decimal na posição correta [1,1,1, 0.5, 0] = 3.5 estrelas
    if (decimalPart) this.stars[Math.ceil(parseInt(this.entity.PostRatingAverage))] = decimalPart;

    // Array de 5 posições/estrelas [1,1,1,0,0] = 3 estrelas
    this.entity.ratings?.map((comment: any) => {
      comment.stars = Array(parseInt(comment.rate)).fill(1);
      comment.stars = comment.stars.concat(Array(5 - parseInt(comment.rate)).fill(0));
    });

    this.entity.PostRatingAverage = parseFloat(this.entity.PostRatingAverage).toFixed(1);
  }

  async addToCollection() {
    const modal = this.modalController.create({
      component: CollectionModalComponent,
      componentProps: {
        collections: this.collections,
        postId: this.entity._id
      }
    });
    (await modal).present();
    this.currentModal = modal;

    (await modal).onDidDismiss().then(data => {
      this.refreshCollectionsData();
      if (data.data === 'addCollection') {
        this.addCollection();
      }
    });
  }

  async addCollection() {
    const modal = this.popoverController.create({
      component: AddCollectionComponent,
      cssClass: 'add-collection',
      componentProps: {
        postId: this.entity._id
      }
    });

    (await modal).onDidDismiss().then(mode => {
      this.refreshCollectionsData();
      if (mode.data === 'create') {
        this.router.navigate(['/collections/my-collections'], { replaceUrl: true });
      }
    });

    (await modal).present();
    this.currentModal = modal;
  }

  async openContactModal(modalTitle: string, receiverEmail: string): Promise<void> {
    (
      await this.modalController.create({
        cssClass: 'contact-modal',
        component: ContactModalComponent,
        componentProps: {
          modalTitle,
          receiverEmail
        }
      })
    ).present();
  }

  async refreshCollectionsData() {
    this.pins = 0;
    await this.dataService
      .getUserInfo()
      .toPromise()
      .then(user => {
        this.user = user.body;
      });

    await this.dataService
      .list('/collections', { UserId: this.user.id })
      .toPromise()
      .then(collections => {
        this.collections = collections.body;
      });

    this.collections.map(entity => {
      const found = entity.postsIds.some((post: any) => {
        return post._id === this.entity._id;
      });
      if (found) {
        this.pins++;
      }
    });
  }

  async starsClick(note: number) {
    const modal = await this.modalController.create({
      component: RatingModalComponent,
      cssClass: 'modal-post-page',
      componentProps: {
        postId: this.entity._id,
        ratingIn: note,
        dismiss: () => modal.dismiss()
      }
    });
    modal.present();
    modal.onDidDismiss().then(() => {
      this.onPostRate.emit();
      this.loadRatingsData();
    });
    this.currentModal = modal;
  }

  async starClick() {
    const modal = await this.modalController.create({
      component: RatingModalComponent,
      cssClass: 'modal-post-page',
      componentProps: {
        postId: this.entity._id,
        dismiss: () => modal.dismiss()
      }
    });
    modal.present();
    modal.onDidDismiss().then(() => {
      this.onPostRate.emit();
      this.loadRatingsData();
    });
    this.currentModal = modal;
  }
}
