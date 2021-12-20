import { Component, EventEmitter, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { FilterService } from '@app/services/filter.service';
import { HeaderService } from '@app/services/header.service';
import { NavigationService } from '@app/services/navigation.service';
import { PushNotificationService } from '@app/services/push-notification.service';
import { UserInfoService } from '@app/services/user-info.service';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { IPost } from '@app/shared/models/post.model';
import { environment } from '@env/environment';
import { IonSlides, ModalController, Platform } from '@ionic/angular';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { FilterCategoryComponent } from './filter/filter-category/filter-category.component';
import { FilterLocationComponent } from './filter/filter-location/filter-location.component';

declare let woopra: any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('categoriesSlider') slides: IonSlides;

  version: string | null = environment.version;
  header: string;
  isLoading = true;
  skeletonLoading = true;
  currentModal: any;
  posts: IPost[] = [];
  postsAux: IPost[] = [];
  postsCopy: IPost[] = [];
  progressBarResults: any;
  // Filter categories
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    slidesPerView: 'auto'
  };
  userInterests: any[];
  categoriesHeader: any[];
  disablePrevBtn: boolean = true;
  disableNextBtn: boolean = false;
  filteringByCategoriesActive: boolean = false;
  minCategories: boolean = false;
  categories: any;

  get currentUserCompany(): ICompanyProfile {
    return this.userInfoService.storedUserInfo.company;
  }

  get userRole(): string {
    return this.userInfoService.storedUserInfo.role;
  }

  get userInfo(): any {
    return this.userInfoService.storedUserInfo;
  }

  get userId(): string {
    return this.userInfoService.storedUserInfo._id;
  }

  get organizationProfileComplete(): boolean {
    return this.userInfoService.storedUserInfo.organization.isComplete;
  }

  constructor(
    public filterService: FilterService,
    private headerService: HeaderService,
    private dataService: DataService,
    private platform: Platform,
    private modalController: ModalController,
    public router: Router,
    private pushNotificationService: PushNotificationService,
    private navigationService: NavigationService,
    private userInfoService: UserInfoService
  ) {}

  ionViewWillEnter() {}

  organizationLoadingProgressBar($event: any) {
    this.progressBarResults = $event;
  }

  ionViewDidEnter() {
    this.header = 'Home';
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'My Posts';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Meus Posts';
    }
    this.headerService.setHeader(this.header);
    this.navigationService.getRoute(window.location.hash);
    this.navigationService.getPostRoutes(window.location.hash);
  }

  ngOnDestroy(): void {}

  loadData(event?: any) {
    let morePosts = this.postsAux.slice(this.posts.length, this.posts.length + 24);
    this.posts = this.posts.concat(morePosts);
    event?.target.complete();
    if (this.posts.length === this.postsAux.length && event) event.target.disabled = true;
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
    woopra.track('feed view', {
      author: user.email,
      id: user.email,
      name: user.email,
      company: user.company.companyName,
      department: user.department,
      jobTitle: user.jobTitle,
      topic: 'Feed Visualization',
      title: document.title,
      url: window.location.href
    });
  }

  filterData() {
    let regions: any[];
    let categories: any[];
    if (this.filterService.feedRegions) {
      regions = this.filterService.feedRegions.map((company: any) => {
        return company._id;
      });
    }

    if (this.filterService.feedCategories) {
      categories = this.filterService.feedCategories.map((category: any) => {
        return category._id;
      });
    }

    if (regions && regions.length > 0) {
      this.postsAux = this.postsCopy.filter(post => {
        let found = post.RecipientsCompanyProfileId.some(companyId => {
          return regions.includes(companyId);
        });
        return found;
      });
    }

    if (categories && categories.length > 0) {
      this.postsAux = this.postsCopy.filter(post => {
        let found = post.Categories.some(categoryId => {
          return categories.includes(categoryId._id);
        });
        return found;
      });
    }
    this.posts = this.postsAux.slice(0, 24);
  }

  getCategoriesByPosts() {
    this.categoriesHeader = this.categories.filter((cat: any) =>
      this.userInterests.some((inte: any) => cat._id === inte.categoryId)
    );
    this.categoriesHeader.forEach(function(item) {
      item.active = false;
    });
    this.minCategories = this.categoriesHeader.length > 0;
  }

  arrowVisibility() {
    let isBeg = this.slides.isBeginning();
    let isEnd = this.slides.isEnd();

    Promise.all([isBeg, isEnd]).then(data => {
      data[0] ? (this.disablePrevBtn = true) : (this.disablePrevBtn = false);
      data[1] ? (this.disableNextBtn = true) : (this.disableNextBtn = false);
    });
  }

  next() {
    this.slides.slideNext();
  }

  prev() {
    this.slides.slidePrev();
  }

  reachedEnd() {
    this.disableNextBtn = true;
  }

  async loadFeedData() {
    await this.dataService
      .list('/post/feed')
      .toPromise()
      .then(posts => {
        if (environment.production) this.woopraIdentify(this.userInfo), this.woopraTrack(this.userInfo);
        this.postsAux = this.postsCopy = posts.body;
      });

    this.categories = _.uniqWith(
      this.postsCopy.flatMap(post => post.Categories),
      _.isEqual
    );
  }

  async loadAdminData() {
    await this.dataService
      .listAll('/post')
      .toPromise()
      .then(posts => {
        this.postsAux = this.postsCopy = posts.body;
      });

    this.categories = _.uniqWith(
      this.postsCopy.flatMap(post => post.Categories),
      _.isEqual
    );
  }

  async loadPosts() {
    this.userRole === 'admin' ? await this.loadAdminData() : await this.loadFeedData();
  }

  async getCategories() {
    this.userInterests = (await this.dataService.list('/interests', { userId: this.userId }).toPromise()).body;
  }

  async selectInterestCategory(category: any, index: any) {
    this.filteringByCategoriesActive = !this.categoriesHeader[index].active;

    this.categoriesHeader[index].active = !this.categoriesHeader[index].active;

    this.categoriesHeader.forEach(function(item, i) {
      i !== index ? (item.active = false) : '';
    });

    // clear filter
    this.filterService.feedCategories = [];

    if (this.filteringByCategoriesActive) {
      this.posts = this.postsCopy.filter((post: IPost) => {
        return post.Categories.map((cat: any) => cat._id)
          .join()
          .includes(category._id.toString());
      });
    } else {
      this.postsAux = this.postsCopy;
      // this.posts = this.postsAux.slice(0, 24);
      this.posts = this.postsAux;
    }
  }

  async filterLocation() {
    const modal = this.modalController.create({
      component: FilterLocationComponent,
      componentProps: {
        type: 'feed-filter'
      }
    });

    (await modal).onDidDismiss().then(() => {
      if (this.filterService.feedRegions && this.filterService.feedRegions.length > 0) {
        this.filterData();
      } else {
        this.postsAux = this.postsCopy;
        this.posts = this.postsAux.slice(0, 24);
      }
    });

    (await modal).present();

    this.currentModal = modal;
  }

  async filterCategory() {
    const modal = this.modalController.create({
      component: FilterCategoryComponent,
      componentProps: {
        type: 'feed-filter'
      }
    });

    (await modal).onDidDismiss().then(() => {
      if (this.filterService.feedCategories && this.filterService.feedCategories.length > 0) {
        this.filterData();
      } else {
        this.postsAux = this.postsCopy;
        // this.posts = this.postsAux.slice(0, 24);
        this.posts = this.postsAux;
      }
    });

    (await modal).present();
    this.currentModal = modal;
  }

  async ngOnInit() {
    this.userInfoService.refreshUserInfo();
    this.platform.ready().then(() => {
      this.pushNotificationService.init();
    });
    await Promise.all([this.loadPosts(), this.getCategories()]);
    if (this.categories) this.getCategoriesByPosts();

    this.loadData();
    (this.filterService.feedCategories || this.filterService.feedRegions) && this.filterData();
    this.isLoading = false;
    this.skeletonLoading = false;
  }
}
