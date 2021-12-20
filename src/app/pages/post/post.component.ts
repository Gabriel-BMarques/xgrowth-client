import { Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CredentialsService } from '@app/core';
import { DataService } from '@app/services/data.service';
import { FilesService } from '@app/services/files.service';
import { HeaderService } from '@app/services/header.service';
import { MediaService } from '@app/services/media.service';
import { NavigationService } from '@app/services/navigation.service';
import { ICollectionPost } from '@app/shared/models/collection-post.model';
import { ICollection } from '@app/shared/models/collections.model';
import { IPost } from '@app/shared/models/post.model';
import { UserAction } from '@app/shared/models/userAction.model';
import { environment } from '@env/environment';
import {
  AlertController,
  Events,
  IonSlides,
  LoadingController,
  ModalController,
  NavController,
  PopoverController
} from '@ionic/angular';
import { Description, DescriptionStrategy, GalleryService, Image } from '@ks89/angular-modal-gallery';
import { map } from 'rxjs/operators';
import { AddCollectionComponent } from '../collections/my-collections/add-collection/add-collection.component';
import { CollectionModalComponent } from './collection-modal/collection-modal.component';
// tslint:disable-next-line: max-line-length

declare let woopra: any;

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  @ViewChild('slides') slides: IonSlides;
  @ViewChild('slidesMobile') slidesMobile: IonSlides;

  videoList: any;
  display = false;
  viewAll = false;
  canEdit: boolean;
  canDelete: boolean;
  header: string;
  isLoading = true;
  post: any;
  active: number = 0;
  activeMobile: number = 0;
  postMock: IPost;
  postId: string;
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };
  skeletonLoading: boolean = false;
  previousUrl: string;
  collections: ICollection[];
  collectionPosts: ICollectionPost[];
  posts: IPost[];
  postIds: any[];
  company: any;
  currentModal: any;
  pins: number;
  categories: any[];
  postCategories: any[];
  viewTimer: any;
  limit = 100;
  limitTag = 16;
  truncating = true;
  similarPosts: any[];
  postVideos: any[] = [];
  user: any;
  similarPostsLoading = true;
  videoThumbnails: any[] = [];
  detailsImages: Image[] = [];
  customFullDescription: Description = {
    strategy: DescriptionStrategy.ALWAYS_HIDDEN,
    style: {
      textColor: 'white',
      marginTop: '1rem',
      position: 'relative'
    }
  };
  isPlayed = false;
  galleryId: number;
  userInfo: any;
  impersonation: boolean;
  userRole: string;
  postType: string;
  currentCompany: any;
  autoLinkerOpts: { replaceFn: () => void };
  _isProcessing: boolean;
  notificationsUser: any[] = [];
  postNotFound: boolean = false;
  isRefreshing: boolean;

  constructor(
    private headerService: HeaderService,
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private filesService: FilesService,
    public location: Location,
    public navCtrl: NavController,
    private galleryService: GalleryService,
    private navigationService: NavigationService,
    private credentialService: CredentialsService,
    private mediaService: MediaService,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public events: Events
  ) {}

  async ngOnInit() {
    this.skeletonLoading = true;
    const loader = await this.loadingController.create({});
    loader.present();
    this.verifyHeaderLang();
    await this.getUserInfo();
    await this.loadPostData();
    if (!this.post) return;
    await this.loadPostViews();
    this.getSimilarPosts();
    this.checkPermissions();
    this.skeletonLoading = false;
    loader.dismiss();
    this.refreshCollectionsData();
    this.generateGalleryId();
    await this.loadNotifications();
    this.isLoading = false;
    this.loadPostMedia(this.post);
  }

  async ionViewWillEnter() {}

  backToHome() {
    if (this.navigationService.previousPostRoute)
      this.router.navigate([this.navigationService.previousPostRoute], { replaceUrl: true });
    else this.router.navigate(['/home'], { replaceUrl: true });
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
                .remove('/post', this.post)
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

  readNotification(notification: any) {
    notification.read = true;
    this.dataService
      .update('/notification-user', notification)
      .toPromise()
      .then(() => {});

    this.events.publish('notification:viewed');
  }

  async loadNotifications() {
    this.notificationsUser = [];
    const notificationsUser: HttpResponse<any[]> = await this.dataService.list('/notification-user').toPromise();
    const items = notificationsUser.body.length > 0 ? notificationsUser.body : [];
    this.notificationsUser = items;
    for (var i = 0; i < this.notificationsUser.length; i++) {
      if (this.notificationsUser[i].postId) {
        if (this.notificationsUser[i].postId._id === this.postId) {
          this.readNotification(this.notificationsUser[i]);
        }
      }
    }
  }
  ionViewDidEnter() {
    this.headerService.setHeader(this.header);
    // this.navigationService.getRoute(window.location.hash);
    this.navigationService.getPostRoutes(window.location.hash);
  }

  generateGalleryId() {
    this.galleryId = Math.floor(Math.random() * 10000);
  }

  viewAllTags() {
    this.viewAll = !this.viewAll;
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

  async onSlideChange() {
    this.active = await this.slides.getActiveIndex();
    this.activeMobile = await this.slidesMobile.getActiveIndex();
  }

  async createViewAction() {
    const userView = new UserAction();
    userView.UserId = this.userInfo.id;
    userView.PostId = this.post._id;
    userView.Type = 1;
    userView.CompanyId = this.userInfo.company;

    await this.dataService
      .create('/users/user-action', userView)
      .toPromise()
      .then(() => {});
  }

  async loadPostViews() {
    const isCreatorCompany = this.userInfo.company === this.post.SupplierId._id;

    if (!this.impersonation && this.userRole !== 'admin' && !isCreatorCompany) {
      await this.createViewAction();
    }

    await this.dataService
      .list('/users/user-action', { PostId: this.post._id, Type: 1 })
      .toPromise()
      .then(views => {
        this.post.Views = views.body.length;
      });
  }

  getPostType() {
    if (this.post.BriefId) {
      this.postType = 'brief-response';
    } else {
      this.postType = 'proactive-posting';
    }
  }

  woopraIdentify(user: any) {
    woopra
      .identify({
        email: user.email,
        id: user.email,
        name: `${user.firstName} ${user.familyName}`,
        firstname: user.firstName,
        familyname: user.familyName,
        company: user.company?.companyName,
        department: user.department,
        jobTitle: user.jobTitle
      })
      .push();
  }
  woopraTrack(user: any) {
    woopra.track('post view', {
      author: user.email,
      id: user.email,
      name: user.email,
      company: user.company.companyName,
      department: user.department,
      jobTitle: user.jobTitle,
      topic: 'Post Details Visualization',
      title: document.title,
      url: window.location.href
    });
  }

  async loadPostData() {
    if (environment.production) this.woopraIdentify(this.userInfo), this.woopraTrack(this.userInfo);
    this.postId = this.route.snapshot.params.id;

    try {
      this.post = (await this.dataService.find('/post/details', this.postId).toPromise()).body;
    } catch (err) {
      this.loadingController.dismiss();
      this.postNotFound = true;
    }

    if (this.post) {
      if (
        this.userInfo._id !== this.post.CreatedBy &&
        this.userInfo.role !== 'admin' &&
        !this.impersonation &&
        this.post.SupplierId.organization._id !== this.userInfo.organization
      ) {
        this.post.Views = this.post.Views + 1;
        await this.dataService.update('/post', this.post).toPromise();
      }
      this.post.createdAt = new Date(this.post.createdAt).toString();
      this.getPostType();
      this.mediaService.getMediaTypes(this.post);
      this.loadGalleryImages();
      this.company = this.post.SupplierId;
      if (this.userRole === 'admin') {
        this.categories = this.post.Categories;
      } else {
        this.categories = this.post.Categories.filter((category: any) => {
          return (
            category.organizationId === this.currentCompany.organization ||
            category.organizationId === null ||
            category.organizationId === undefined
          );
        });
      }
    }
  }

  checkPermissions() {
    if (this.post.CreatedBy) {
      if (this.post.CreatedBy._id === this.userInfo.id || this.userRole === 'admin') {
        this.canEdit = true;
      } else {
        this.canEdit = false;
      }
      if (this.post.CreatedBy._id === this.userInfo.id) {
        this.canDelete = true;
      } else {
        this.canDelete = false;
      }
    } else {
      this.canDelete = false;
      this.canEdit = true;
    }
  }

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Post';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Post';
    }
  }

  ionViewWillLeave() {
    this.galleryService.closeGallery(1);
    this.galleryService.stop(1);
    const mediaElem = document.getElementsByTagName('video');
    if (mediaElem[0]) {
      mediaElem[0].pause();
    }
  }

  async addToCollection() {
    const modal = this.modalController.create({
      component: CollectionModalComponent,
      componentProps: {
        collections: this.collections,
        collectionPosts: this.collectionPosts,
        postId: this.postId
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
        postId: this.postId
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

  getPlayerId(index: string, type: string) {
    return `p${index}-${type}`;
  }

  loadGalleryImages() {
    this.post.UploadedFiles.map((file: any, key: number = 0) => {
      if (file.isImage) {
        this.detailsImages.push(new Image(key, { img: file.url, description: `Image ${key + 1}` }));
      }
    });
  }

  async downloadAttachment(url: string, fileName: string) {
    this.filesService.download(url, fileName);
  }

  openModalViaService(id: number | undefined, index: number) {
    this.galleryService.openGallery(id, index);
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
      .listAll('/collections')
      .toPromise()
      .then(collections => {
        this.collections = collections.body.filter(collection => {
          return collection.UserId === this.user.id;
        });
      });

    this.collections.map(entity => {
      const found = entity.postsIds.some((post: any) => {
        return post._id === this.postId;
      });
      if (found) {
        this.pins++;
      }
    });
  }

  loadPostMedia(entity: any) {
    this.mediaService.loadMedia(entity);
  }

  next() {
    this.slides.slideNext();
  }

  prev() {
    this.slides.slidePrev();
  }

  fallbackImage(i: number) {
    if (this.post.UploadedFiles[i]) {
      this.post.UploadedFiles[i].url = 'https://picsum.photos/id/122/130/160';
      return this.post.UploadedFiles[i].url;
    }
  }

  imageClick(id?: string) {
    this.router.navigate(['/post/details/', id], { replaceUrl: true });
  }

  titleClick(id?: string) {
    this.router.navigate(['/post/details/', id], { replaceUrl: true });
  }

  async subtitleClick(id?: string) {
    await this.dataService
      .find('/company-profile', id)
      .toPromise()
      .then(res => {
        const {
          organization: { _id: organizationId }
        } = res.body;
        this.router.navigate([`/organization/${organizationId}/overview`], { replaceUrl: true });
      });
  }

  async getSimilarPosts() {
    this.similarPostsLoading = true;
    const categories = this.post.Categories.map((category: any) => {
      return category._id;
    });
    await this.dataService
      .list('/post/feed')
      .pipe(
        map(response =>
          response.body.filter(p => {
            const intersection = p.Categories.filter((c: any) => categories.includes(c._id));
            return p._id !== this.post._id && intersection.length;
          })
        )
      )
      .toPromise()
      .then(posts => (this.similarPosts = posts));
    this.similarPostsLoading = false;
  }

  edit() {
    switch (this.postType) {
      case 'brief-response':
        this.router.navigate(['/briefs/add-response/edit', this.post._id], { replaceUrl: true });
        break;
      case 'proactive-posting':
        this.router.navigate(['/post/add/edit', this.post._id], { replaceUrl: true });
        break;
      default:
        break;
    }
  }

  back() {
    if (this.navigationService.previousRoute)
      this.router.navigate([this.navigationService.previousRoute], { replaceUrl: true });
    else this.router.navigate(['/home'], { replaceUrl: true });
  }

  async goToProfile(company: any) {
    await this.dataService
      .find('/company-profile', this.post.SupplierId._id)
      .toPromise()
      .then(res => {
        const {
          organization: { _id: organizationId }
        } = res.body;
        this.router.navigate(['/organization', organizationId, '/overview'], { replaceUrl: true });
      });
  }

  share() {
    this.router.navigate(['/post/share', this.postId], { replaceUrl: true });
  }

  ngOnDestroy() {
    this.mediaService.destroyPlayer();
    this.loadingController.dismiss();
  }

  async refreshData() {
    this.isRefreshing = true;
    this.post = (await this.dataService.find('/post/details', this.post._id).toPromise()).body;
    this.mediaService.getMediaTypes(this.post);
    this.loadGalleryImages();
    this.isRefreshing = false;
  }
}
