import { CredentialsService } from './../../core/authentication/credentials.service';
import { UserInfoService } from './../../services/user-info.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RoutesRecognized } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { FilesService } from '@app/services/files.service';
import { HeaderService } from '@app/services/header.service';
import { MediaService } from '@app/services/media.service';
import { MigrationService } from '@app/services/migration.service';
import { MockService } from '@app/services/mock.service';
import { NavigationService } from '@app/services/navigation.service';
import { ResponseAddWizardService } from '@app/services/response-add-wizard.service';
import { ICollectionPost } from '@app/shared/models/collection-post.model';
import { ICollection } from '@app/shared/models/collections.model';
import { IPost } from '@app/shared/models/post.model';
import { ModalController, PopoverController } from '@ionic/angular';
import { filter, pairwise } from 'rxjs/operators';

@Component({
  selector: 'app-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.scss']
})
export class ResponseComponent implements OnInit {
  header: string;
  isLoading = true;
  post: any;
  postMock: IPost;
  postId: string;
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };
  skeletonLoading = true;
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
  truncating = true;
  impersonation: boolean;

  constructor(
    private userInfoService: UserInfoService,
    private headerService: HeaderService,
    private mockService: MockService,
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private filesService: FilesService,
    private migrationService: MigrationService,
    private wizard: ResponseAddWizardService,
    private navigationService: NavigationService,
    private mediaService: MediaService,
    private credentialsService: CredentialsService
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(
        filter((evt: any) => evt instanceof RoutesRecognized),
        pairwise()
      )
      .subscribe((events: RoutesRecognized[]) => {
        this.previousUrl = events[0].urlAfterRedirects;
      });
    this.verifyHeaderLang();
    this.postId = this.route.snapshot.params.id;
    this.headerService.setHeader(this.header);
    this.navigationService.getRoute(window.location.hash);
    this.impersonation = this.credentialsService.credentials.impersonation;
    this.dataService
      .find('/post', this.postId)
      .toPromise()
      .then(foundPost => {
        this.post = foundPost.body;
        this.post.createdAt = new Date(this.post.createdAt).toString();
        if (
          this.userInfoService.storedUserInfo._id !== this.post.CreatedBy &&
          this.userInfoService.storedUserInfo.role !== 'admin' &&
          !this.impersonation &&
          this.post.SupplierId.organization._id !== this.userInfoService.storedUserInfo.organization._id
        ) {
          this.post.Views = this.post.Views + 1;
        }
        this.dataService
          .update('/post', this.post)
          .toPromise()
          .then(() => {
            this.refreshData();
          });
      });
  }

  ionViewWillEnter() {}

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Post';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Post';
    }
  }

  ionViewWillLeave() {
    const mediaElem = document.getElementsByTagName('video');
    if (mediaElem[0]) {
      mediaElem[0].pause();
    }
  }

  refreshData() {
    this.pins = 0;
    this.dataService
      .getUserInfo()
      .toPromise()
      .then(user => {
        this.dataService
          .listAll('/collections')
          .toPromise()
          .then(collections => {
            this.collections = collections.body.filter(collection => {
              return collection.UserId === user.body.id;
            });
            collections.body.map(entity => {
              const found = entity.postsIds.some((post: any) => {
                return post._id === this.postId;
              });
              if (found) {
                this.pins++;
              }
            });
            this.loadPostImages(this.post);
            this.company = this.post.SupplierId;
            this.categories = this.post.Categories;
            this.skeletonLoading = false;
            this.isLoading = false;
          });
      });
  }

  loadPostImages(entity: any) {
    const videoFormats = ['mp4', 'wmv', 'avi', 'mov'];
    if (entity.UploadedFiles.length > 0) {
      this.mediaService.orderImages(entity);
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
  }

  fallbackImage(i: number) {
    if (this.post.UploadedFiles[i]) {
      this.post.UploadedFiles[i].url = 'https://picsum.photos/id/122/130/160';
      return this.post.UploadedFiles[i].url;
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
        this.router.navigate([`/organization/${organizationId}/overview`], { replaceUrl: true });
      });
  }

  share() {
    this.router.navigate(['/post/share', this.postId], { replaceUrl: true });
  }

  edit() {
    this.router.navigate(['/briefs/add-response', 'edit', this.postId], { replaceUrl: true });
  }
}
