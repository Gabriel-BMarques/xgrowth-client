import { NavigationService } from '../../../services/navigation.service';
import { Image } from '@ks89/angular-modal-gallery';
import { ViewMoreModalComponent } from '../view-more-modal/view-more-modal.component';
import { AddCollectionComponent } from '../../../pages/collections/my-collections/add-collection/add-collection.component';
import { CollectionModalComponent } from '../../../pages/post/collection-modal/collection-modal.component';
import { NavigationStart, Router } from '@angular/router';
import { MediaService } from '../../../services/media.service';
import { IonSlides, ModalController, PopoverController, AlertController } from '@ionic/angular';
import { DataService } from '../../../services/data.service';
import { UserInfoService } from '../../../services/user-info.service';
import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { CredentialsService } from '@app/core';
import { filter, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ContactModalComponent } from '../contact-modal/contact-modal.component';
import { UserAction } from '../../models/userAction.model';
import * as _ from 'lodash';
import { ICollection } from '../../models/collections.model';
import { ImageModalComponent } from '../image-modal/image-modal.component';

@Component({
  selector: 'modal-post',
  templateUrl: './modal-post.component.html',
  styleUrls: ['./modal-post.component.scss']
})
export class ModalPostComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('slides') slides: IonSlides;
  @ViewChild('slidesMobile') slidesMobile: IonSlides;
  @ViewChild('dadDiv') dadDiv: any;
  @ViewChild('childDiv') childDiv: any;
  @ViewChild('dadCatDiv') dadCatDiv: any;
  @ViewChild('childCatDiv') childCatDiv: any;
  @ViewChild('postRating') postRating: any;
  // post n user data
  @Input() postId: any;
  @Input() type: any;
  @Input() dismiss: () => void;
  @Input() actionEvent: EventEmitter<object>;
  isLoading = true;
  isRefreshing = false;
  user: any;
  company: any;
  entity: any;
  detailsImages: Image[] = [];
  similarPosts: any[];
  similarPostsAux: any[];
  impersonation: boolean;

  // page data
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };
  active: number = 0;
  activeMobile: number = 0;
  display = false;
  collections: ICollection[];
  currentModal: any;
  briefAdmins: any;
  briefMainContact: any;
  hasTruncated: boolean;
  allMarkets: string;
  _truncated: boolean = true;
  _truncatedCat: boolean = true;
  _hasMoreText: boolean;
  similarPostsLoading: boolean = true;
  $routerEvents: Subscription;
  readMore: boolean = false;
  hasPostDescriptionTruncated: boolean = false;
  disablePostTruncation: boolean = false;

  // Post rating data
  stars: any;
  rating = 0;

  get isLast(): boolean {
    return this.active === this.entity.UploadedFiles.length - 1;
  }

  get isFirst(): boolean {
    return this.active === 0;
  }

  get isLoadingVideos(): boolean {
    return this.mediaService.isLoading;
  }

  get canSeeMetrics(): boolean {
    if (
      this.entity.SupplierId.organization._id === this.userInfoService.storedUserInfo.organization._id ||
      (this.userInfoService.storedUserInfo.role === 'admin' && this.postType === 'proactive-posting')
    )
      return true;
    else return false;
  }

  get hasMoreText() {
    const dadDiv = this.dadDiv.nativeElement.offsetHeight;
    const childDiv = this.childDiv.nativeElement.offsetHeight;
    this._truncated = childDiv > dadDiv && !this._truncated;
    return childDiv > dadDiv;
  }

  get canDelete(): boolean {
    return this.entity.canDelete;
  }

  get postType(): string {
    return this.entity.BriefId ? 'brief-response' : 'proactive-posting';
  }

  get canEdit(): boolean {
    return this.entity.canEdit;
  }

  get createViewCondition(): boolean {
    return (
      this.userInfoService.storedUserInfo._id !== this.entity.CreatedBy &&
      this.userInfoService.storedUserInfo.role !== 'admin' &&
      !this.impersonation &&
      this.entity.SupplierId.organization._id !== this.userInfoService.storedUserInfo.organization._id
    );
  }

  constructor(
    public userInfoService: UserInfoService,
    private dataService: DataService,
    private modalController: ModalController,
    private mediaService: MediaService,
    private router: Router,
    private popoverController: PopoverController,
    public alertController: AlertController,
    private navigationService: NavigationService,
    private credentialsService: CredentialsService,
    private cdRef: ChangeDetectorRef
  ) {
    this.$routerEvents = this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => this.dismiss());
  }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.$routerEvents.unsubscribe();
  }

  loadPostMedia(entity: any) {
    this.mediaService.loadMedia(entity);
  }

  hasOverflow(parentElement: HTMLElement, childElement: HTMLElement): boolean {
    return childElement.offsetHeight > parentElement.offsetHeight;
  }

  viewMore(items: any[], type: string, modalTitle: string) {
    this.modalController
      .create({
        component: ViewMoreModalComponent,
        cssClass: 'view-more-modal',
        componentProps: {
          items,
          type,
          modalTitle
        }
      })
      .then(modal => modal.present());
  }

  viewMoreText(parentElement: HTMLElement, childElement: HTMLElement) {
    this.readMore = true;
    parentElement.style.height = `${childElement.offsetHeight}px`;
  }

  viewLessText(parentElement: HTMLElement) {
    this.readMore = false;
    parentElement.style.height = '7.8125rem';
  }

  loadGalleryImages() {
    this.entity.UploadedFiles.map((file: any, key: number = 0) => {
      if (file.isImage) {
        this.detailsImages.push(new Image(key, { img: file.url, description: `Image ${key + 1}` }));
      }
    });
  }

  loadData(event?: any) {
    console.log(event);
    let morePosts = this.similarPostsAux.slice(this.similarPosts.length, this.similarPosts.length + 8);
    this.similarPosts = this.similarPosts.concat(morePosts);
    event?.target.complete();
    if (this.similarPosts.length === this.similarPostsAux.length) event.target.disabled = true;
  }

  getPlayerId(index: string, type: string) {
    return `p${index}-${type}`;
  }

  fallbackImage(i: number) {
    if (this.entity.UploadedFiles[i]) {
      this.entity.UploadedFiles[i].url = 'https://picsum.photos/id/122/130/160';
      return this.entity.UploadedFiles[i].url;
    }
  }

  next() {
    this.slides.slideNext();
  }

  prev() {
    this.slides.slidePrev();
  }

  share() {
    this.router.navigate(['/post/share', this.entity._id], { replaceUrl: true });
  }

  edit() {
    switch (this.type) {
      case 'post':
        switch (this.postType) {
          case 'brief-response':
            this.router.navigate(['/briefs/add-response/edit', this.entity._id], { replaceUrl: true });
            break;
          case 'proactive-posting':
            this.router.navigate(['/post/add/edit', this.entity._id], { replaceUrl: true });
            break;
          default:
            break;
        }
        break;
      case 'my-brief':
        this.router.navigate(['/briefs/add-brief/edit', this.entity._id], { replaceUrl: true });
        break;
    }
  }

  deletePost() {
    this.alertController
      .create({
        cssClass: 'alert-delete',
        header: 'Delete Post',
        message: 'Are you sure?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            handler: () => {
              this.dataService
                .remove('/post', this.entity)
                .toPromise()
                .then(() => {
                  this.actionEvent.emit({ action: 'postDelete' });
                  this.dismiss();
                });
            }
          }
        ]
      })
      .then(alerEl => {
        alerEl.present();
      });
  }

  backToHome() {
    if (this.navigationService.previousPostRoute)
      this.router.navigate([this.navigationService.previousPostRoute], { replaceUrl: true });
    else this.router.navigate(['/home'], { replaceUrl: true });
  }

  closeModal() {
    this.dismiss();
  }

  openBrief() {
    this.entity.isActive = true;
    this.dataService
      .update('/brief', this.entity)
      .toPromise()
      .then(() => {});
  }

  handler(res: boolean) {
    if (!this.hasTruncated) this.hasTruncated = res;
  }

  handlerDescription(res: boolean) {
    if (!this.hasPostDescriptionTruncated) this.hasPostDescriptionTruncated = res;
  }

  prepareDataMarket() {
    this.allMarkets = this.entity?.Markets?.map((mar: any) => mar.name)
      .join(', ')
      .concat('.');
  }

  toggleTruncateMarket() {
    this.modalController
      .create({
        component: ViewMoreModalComponent,
        cssClass: 'view-more-modal',
        componentProps: {
          type: 'markets',
          subSegments: this.entity?.Markets
        }
      })
      .then(modalEl => modalEl.present());
  }

  toggleTruncate() {
    this._truncated = !this._truncated;
  }

  toggleTruncateCat() {
    this._truncatedCat = !this._truncatedCat;
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

  async openGallery(uploadedFiles: any) {
    const modal = await this.modalController.create({
      component: ImageModalComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        uploadedFiles: uploadedFiles
      },
      backdropDismiss: true
    });
    modal.present();
  }

  async goToProfile(entity: any) {
    this.router.navigate([`/organization/${entity.SupplierId.organization._id}/overview`], { replaceUrl: true });
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

  async refreshData() {
    this.isRefreshing = true;
    await this.loadPostData();
    this.isRefreshing = false;
  }

  async getRelatedCategories() {
    this.entity.Categories = (await this.dataService.list('/category/company').toPromise()).body.filter(category => {
      return this.entity.Categories.some((cat: any) => cat._id === category._id);
    });
  }

  async refreshCollectionsData() {
    this.collections = (await this.dataService.list('/collections', { UserId: this.user._id }).toPromise()).body;
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

  async loadUserData() {
    this.user = this.userInfoService.storedUserInfo;
    this.impersonation = this.credentialsService.credentials.impersonation;
  }

  async loadPostData() {
    this.entity = (await this.dataService.find('/post/details', this.postId).toPromise()).body;
    console.log(this.entity);
    if (this.createViewCondition) {
      this.entity.Views += 1;
      this.dataService.update('/post', this.entity).toPromise();
    }
    this.mediaService.getMediaTypes(this.entity);
    this.loadGalleryImages();
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

  async getSimilarPosts() {
    this.similarPostsLoading = true;
    const categories = this.entity.Categories.map((category: any) => {
      return category._id;
    });
    await this.dataService
      .list('/post/feed')
      .pipe(
        map(response =>
          response.body.filter(p => {
            const intersection = p.Categories.filter((c: any) => categories.includes(c._id));
            return p._id !== this.entity._id && intersection.length;
          })
        )
      )
      .toPromise()
      .then(posts => {
        this.similarPostsAux = posts;
        console.log(this.similarPostsAux);
        this.similarPosts = this.similarPostsAux.slice(0, 8);
        this.similarPostsLoading = false;
      });
  }

  async onSlideChange() {
    this.active = await this.slides.getActiveIndex();
  }

  async onSlideChangeMobile() {
    this.activeMobile = await this.slidesMobile.getActiveIndex();
  }

  async ngOnInit() {
    this.isLoading = true;
    await this.loadUserData();
    await this.loadPostData();
    await Promise.all([this.getRelatedCategories(), this.refreshCollectionsData(), this.createViewAction()]);
    this.prepareDataMarket();
    this.isLoading = false;
    this.loadPostMedia(this.entity);
    if (this.postType === 'proactive-posting') await this.getSimilarPosts();
  }

  private createViewAction() {
    if (
      this.userInfoService.storedUserInfo._id !== this.entity.CreatedBy &&
      this.userInfoService.storedUserInfo.role !== 'admin' &&
      !this.impersonation &&
      this.entity.SupplierId.organization._id !== this.userInfoService.storedUserInfo.organization._id
    ) {
      let viewPostAction = new UserAction();
      viewPostAction.PostId = this.postId;
      viewPostAction.UserId = this.userInfoService.storedUserInfo._id;
      viewPostAction.Type = 1;
      viewPostAction.CompanyId = this.userInfoService.storedUserInfo.company._id;
      this.dataService.create('/users/user-action', viewPostAction).toPromise();
    }
  }
}
