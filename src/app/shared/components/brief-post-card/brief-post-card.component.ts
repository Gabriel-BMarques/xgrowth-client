import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CredentialsService } from '@app/core';
import { DataService } from '@app/services/data.service';
import { FilesService } from '@app/services/files.service';
import { MediaService } from '@app/services/media.service';
import { NavigationService } from '@app/services/navigation.service';
import { ICollection } from '@app/shared/models/collections.model';
import { ViewMoreModalComponent } from '@app/shared/modals/view-more-modal/view-more-modal.component';
import { AlertController, IonSlides, ModalController, PopoverController } from '@ionic/angular';
import { CloseBriefComponent } from '../../../pages/briefs/my-brief/close-brief/close-brief.component';
import { AddCollectionComponent } from '../../../pages/collections/my-collections/add-collection/add-collection.component';
import { CollectionModalComponent } from '../../../pages/post/collection-modal/collection-modal.component';
import { ImageModalComponent } from '../../modals/image-modal/image-modal.component';
import { ICategory } from '../../models/category.model';
import { ContactModalComponent } from '../../modals/contact-modal/contact-modal.component';
import { Image } from '@ks89/angular-modal-gallery';
import { UserInfoService } from '../../../services/user-info.service';

@Component({
  selector: 'app-brief-post-card',
  templateUrl: './brief-post-card.component.html',
  styleUrls: ['./brief-post-card.component.scss']
})
export class BriefPostCardComponent implements OnInit, AfterViewChecked {
  @ViewChild('slides') slides: IonSlides;
  @ViewChild('slidesMobile') slidesMobile: IonSlides;
  @ViewChild('postRating') postRating: any;

  @Input() mode: any;
  @Input() entity: any;
  @Input() type: any;
  @Input() company: any;
  @Input() userInfo: any;

  isCategoriesOverflown: boolean = false;

  briefMainContact: any;
  briefAdmins: any;

  slideOpts = {
    initialSlide: 0,
    speed: 400
  };
  active: number = 0;
  activeMobile: number = 0;
  display = false;
  truncating = false;
  limit = 500;
  limitTag = 12;
  viewAll = false;
  collections: ICollection[];
  currentModal: any;
  pins: number;
  user: any;
  userRole: string;
  impersonation: boolean;
  currentCompany: any;
  dadHeight: number;
  childHeight: number;
  _truncated: boolean = true;
  _truncatedCat: boolean = true;
  hasTruncated: boolean;
  allMarkets: string;
  readMore: boolean = false;
  isRefreshing: boolean;
  detailsImages: Image[] = [];
  hasDescriptionTruncated: boolean = false;
  disableTruncation: boolean = false;

  get isLast(): boolean {
    return this.active === this.entity.UploadedFiles.length - 1;
  }

  get isFirst(): boolean {
    return this.active === 0;
  }

  get canSeeMetrics(): boolean {
    if (
      this.company.organization._id === this.userInfo.organization._id ||
      (this.userInfo.role === 'admin' && this.postType === 'proactive-posting')
    )
      return true;
    else return false;
  }

  get createViewCondition(): boolean {
    return (
      this.userInfoService.storedUserInfo._id !== this.entity.CreatedBy &&
      this.userInfoService.storedUserInfo.role !== 'admin' &&
      !this.impersonation &&
      this.entity.SupplierId.organization._id !== this.userInfoService.storedUserInfo.organization._id
    );
  }

  get isLoadingVideos(): boolean {
    return this.mediaService.isLoading;
  }

  get canEdit(): boolean {
    if (this.entity.CreatedBy && this.briefAdmins) {
      const createdBy = this.entity.CreatedBy._id || this.entity.CreatedBy;
      const isBriefAdmin = this.briefAdmins.some((member: any) => member === this.userInfo.id);
      return createdBy === this.userInfo.id || this.userInfo.role === 'admin' || isBriefAdmin;
    }
    return false;
  }

  get canDelete(): boolean {
    return this.entity.canDelete;
  }

  get postType(): string {
    if (this.entity.BriefId) {
      return 'brief-response';
    } else {
      return 'proactive-posting';
    }
  }

  constructor(
    private filesService: FilesService,
    private router: Router,
    private modalController: ModalController,
    private dataService: DataService,
    private popoverController: PopoverController,
    private mediaService: MediaService,
    private credentialService: CredentialsService,
    private navigationService: NavigationService,
    public alertController: AlertController,
    private cdRef: ChangeDetectorRef,
    public userInfoService: UserInfoService
  ) {}

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  hasOverflow(parentElement: HTMLElement, childElement: HTMLElement): boolean {
    return parentElement.offsetHeight < childElement.offsetHeight;
  }

  hasDescriptionOverflow(description: string): boolean {
    const maxDescriptionSize = description.slice(0, 150).length;
    return maxDescriptionSize !== description.length;
  }

  hasCategoryOverflown(categories: ICategory[] = []) {
    console.log(categories);
    const maxCategoriesSize = categories.slice(10).length;
    return maxCategoriesSize === categories.length;
  }

  prepareDataMarket() {
    this.allMarkets = this.entity?.Markets?.map((mar: any) => mar.name)
      .join(', ')
      .concat('.');
  }

  loadGalleryImages() {
    this.entity.UploadedFiles.map((file: any, key: number = 0) => {
      if (file.isImage) {
        this.detailsImages.push(new Image(key, { img: file.url, description: `Image ${key + 1}` }));
      }
    });
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
                .then();
              this.backToHome();
            }
          }
        ]
      })
      .then(alerEl => {
        alerEl.present();
      });
  }

  toggleTruncate() {
    this._truncated = !this._truncated;
  }

  toggleTruncateMarket() {
    this.modalController
      .create({
        component: ViewMoreModalComponent,
        cssClass: 'view-more-modal',
        componentProps: {
          type: 'markets',
          items: this.entity?.Markets
        }
      })
      .then(modalEl => modalEl.present());
  }

  handler(res: boolean) {
    if (!this.hasTruncated) this.hasTruncated = res;
  }

  handlerDescription(res: boolean) {
    if (!this.hasDescriptionTruncated) this.hasDescriptionTruncated = res;
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

  share() {
    this.router.navigate(['/post/share', this.entity?._id], { replaceUrl: true });
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

  backToHome() {
    if (this.navigationService.previousPostRoute)
      this.router.navigate([this.navigationService.previousPostRoute], { replaceUrl: true });
    else this.router.navigate(['/home'], { replaceUrl: true });
  }

  next() {
    this.slides.slideNext();
  }

  prev() {
    this.slides.slidePrev();
  }

  openBrief() {
    this.entity.isActive = true;
    this.dataService
      .update('/brief', this.entity)
      .toPromise()
      .then(() => {});
  }

  async onSlideChange() {
    this.active = await this.slides.getActiveIndex();
  }

  async onSlideChangeMobile() {
    this.activeMobile = await this.slidesMobile.getActiveIndex();
  }

  async downloadAttachment(url: string, fileName: string) {
    this.filesService.download(url, fileName);
  }

  async goToProfile(company: any) {
    this.router.navigate([`/organization/${company.organization._id}/overview`], { replaceUrl: true });
  }

  async openGallery(uploadedFiles: any) {
    const modal = await this.modalController.create({
      component: ImageModalComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        uploadedFiles: uploadedFiles
      }
    });
    modal.present();
  }

  async getBriefMainContact() {
    this.briefAdmins = (await this.dataService.list('/brief-member', { BriefId: this.entity?._id }).toPromise()).body;
    this.briefMainContact = this.briefAdmins[0];
    this.briefAdmins = this.briefAdmins
      .filter((member: any) => member.Admin)
      .map((member: any) => member.UserId?.id || member.UserId?._id);
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

  async getUserInfo() {
    this.impersonation = this.credentialService.credentials.impersonation;
    this.userRole = this.credentialService.checkRole;
    await this.dataService
      .getUserInfo()
      .toPromise()
      .then(user => {
        this.userInfo = user.body;
      });
    await this.dataService
      .getUserCompany()
      .toPromise()
      .then(company => {
        this.currentCompany = company.body;
      });
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

  async getRelatedCategories() {
    await this.dataService
      .list('/category/company')
      .toPromise()
      .then(res => {
        this.entity.Categories = res.body.filter(category => {
          return this.entity.Categories.some((cat: any) => cat._id === category._id);
        });
      });
  }

  async closeBrief() {
    const modal = await this.popoverController.create({
      component: CloseBriefComponent,
      componentProps: {
        brief: this.entity
      },
      cssClass: 'close-brief'
    });

    modal.onDidDismiss().then(res => {
      this.entity.isActive = res.data;
    });

    modal.present();
  }

  async ngOnInit() {
    await Promise.all([this.getRelatedCategories(), this.refreshCollectionsData()]);
    if (!this.entity.SupplierId) await this.getBriefMainContact();
    this.isCategoriesOverflown = this.hasCategoryOverflown(this.entity.Categories);
    await this.getBriefMainContact();
    this.prepareDataMarket();
  }
}
