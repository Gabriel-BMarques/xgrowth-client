import { Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CredentialsService } from '@app/core/authentication/credentials.service';
import { DataService } from '@app/services/data.service';
import { FilesService } from '@app/services/files.service';
import { HeaderService } from '@app/services/header.service';
import { MediaService } from '@app/services/media.service';
import { MockService } from '@app/services/mock.service';
import { NavigationService } from '@app/services/navigation.service';
import { PostAddWizardService } from '@app/services/post-add-wizard.service';
import { UserInfoService } from '@app/services/user-info.service';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { IItem } from '@app/shared/models/item.model';
import { PanelData } from '@app/shared/models/panelData.model';
import { IPost } from '@app/shared/models/post.model';
import { IResponse } from '@app/shared/models/response.model';
import { IUser } from '@app/shared/models/user.model';
import { UserAction } from '@app/shared/models/userAction.model';
import { environment } from '@env/environment';
import { Events, IonSlides, LoadingController, ModalController, PopoverController } from '@ionic/angular';
import { Description, DescriptionStrategy, GalleryService, Image } from '@ks89/angular-modal-gallery';
import { ImageModalComponent } from '../../../shared/modals/image-modal/image-modal.component';
import { CloseBriefComponent } from './close-brief/close-brief.component';

declare let Plyr: any;

declare let woopra: any;

@Component({
  selector: 'app-my-brief',
  templateUrl: './my-brief.component.html',
  styleUrls: ['./my-brief.component.scss']
})
export class MyBriefComponent implements OnInit {
  @ViewChild('slides') slides: IonSlides;
  @ViewChild('slidesMobile') slidesMobile: IonSlides;

  active: number = 0;
  activeMobile: number = 0;
  isLoading = true;
  skeletonLoading = true;
  companyName: string;
  panelData: PanelData;
  briefMock: IPost;
  brief: any;
  responseMock: IResponse;
  briefId: string;
  posts: IPost[];
  section1: PanelData = new PanelData();
  company: ICompanyProfile;
  category: PanelData;
  arrayCategories: IItem[] = [];
  briefResponses: any[] = [];
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };

  limit = 100;
  limitTag = 16;
  truncating = true;
  viewAll = false;
  userRole: string;
  canEdit = true;
  isSolver = false;
  user: IUser;
  briefVideos: any[] = [];
  videoThumbnails: any[] = [];
  display = false;
  detailsImages: Image[] = [];
  customFullDescription: Description = {
    strategy: DescriptionStrategy.ALWAYS_HIDDEN,
    style: {
      textColor: 'white',
      marginTop: '1rem',
      position: 'relative'
    }
  };
  galleryId: number;
  currentCompany: any;
  categories: any;
  modalController: any;
  notificationsUser: any[] = [];
  postNotFound: boolean = false;
  impersonation: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private credentials: CredentialsService,
    private dataService: DataService,
    private popover: PopoverController,
    private filesService: FilesService,
    private galleryService: GalleryService,
    private navigationService: NavigationService,
    private mediaService: MediaService,
    private ModalController: ModalController,
    private loadingController: LoadingController,
    private userInfoService: UserInfoService,
    public events: Events
  ) {}

  get userInfo(): any {
    return this.userInfoService.storedUserInfo;
  }

  async ngOnInit() {
    const loader = await this.loadingController.create({});
    loader.present();
    this.userRole = this.credentials.checkRole;
    this.briefId = this.route.snapshot.params.id;
    this.user = this.userInfoService.storedUserInfo;
    this.currentCompany = this.userInfoService.storedUserInfo.company;
    this.impersonation = this.credentials.credentials.impersonation;
    await this.loadNotifications();
    await this.refreshData();
    await this.userActionViewBrief();
    if (!this.brief) return;
    await loader.dismiss();
    this.isLoading = false;
  }

  backBriefs() {
    if (this.navigationService.previousBriefRoute) {
      this.router.navigate([this.navigationService.previousBriefRoute], { replaceUrl: true });
    } else this.router.navigate(['/briefs'], { replaceUrl: true });
  }

  async ionViewWillEnter() {
    this.userInfoService.refreshUserInfo();
  }

  async readNotification(notification: any) {
    notification.read = true;
    await this.dataService.update('/notification-user', notification).toPromise();
    this.events.publish('notification:viewed');
  }

  async loadNotifications() {
    this.notificationsUser = [];
    const notificationsUser: HttpResponse<any[]> = await this.dataService.list('/notification-user').toPromise();
    const items = notificationsUser.body.length > 0 ? notificationsUser.body : [];
    this.notificationsUser = items;
    for (var i = 0; i < this.notificationsUser.length; i++) {
      if (this.notificationsUser[i].briefId) {
        if (this.notificationsUser[i].briefId._id === this.briefId) {
          await this.readNotification(this.notificationsUser[i]);
        }
      }
    }
  }

  ionViewDidEnter() {
    this.navigationService.getRoute(window.location.hash);
    this.navigationService.getPostRoutes(window.location.hash);
    this.navigationService.getBriefRouter(window.location.hash);
  }

  getPlayerId(index: string, type: string) {
    return `p${index}-${type}`;
  }

  async downloadAttachment(fileUrl: string, fileName: string) {
    this.filesService.download(fileUrl, fileName);
  }
  viewAllTags() {
    this.viewAll = !this.viewAll;
  }

  async refreshData() {
    if (environment.production) this.woopraIdentify(this.userInfo), this.woopraTrack(this.userInfo);
    await this.dataService
      .find('/brief', this.briefId)
      .toPromise()
      .then(brief => {
        this.brief = brief.body;
      })
      .catch(err => {
        this.loadingController.dismiss();
        this.postNotFound = true;
      });

    if (!this.brief) return;

    if (this.userRole === 'admin') {
      this.categories = this.brief.Categories;
    } else {
      this.categories = this.brief.Categories.filter((category: any) => {
        return (
          category.organizationId === this.currentCompany.organization ||
          category.organizationId === null ||
          category.organizationId === undefined
        );
      });
    }

    await this.dataService
      .list('/post', { BriefId: this.briefId })
      .toPromise()
      .then(briefResponses => {
        this.briefResponses = briefResponses.body.filter(response => response.IsDraft !== true);
      });
    this.mediaService.getMediaTypes(this.brief);
    this.loadBriefMedia(this.brief);
    this.loadGalleryImages();
    this.generateGalleryId();

    await this.verifyPermissions();
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
    woopra.track('brief details view', {
      author: user.email,
      id: user.email,
      name: user.email,
      company: user.company.companyName,
      department: user.department,
      jobTitle: user.jobTitle,
      topic: 'Brief Details Visualization',
      title: document.title,
      url: window.location.href
    });
  }

  generateGalleryId() {
    this.galleryId = Math.floor(Math.random() * 10000);
  }

  async verifyPermissions() {
    if (this.brief.CreatedBy) {
      if (this.user.id === this.brief.CreatedBy._id || this.userRole === 'admin') {
        this.canEdit = true;
      } else {
        await this.dataService
          .listById('/brief-member', this.brief._id)
          .toPromise()
          .then(members => {
            const currentBriefMember = members.body.find(member => {
              return member.UserId === this.user.id;
            });
            if (currentBriefMember) {
              currentBriefMember.Admin === true ? (this.canEdit = true) : (this.canEdit = false);
            } else {
              this.canEdit = false;
            }
          });
      }
    }
  }

  loadGalleryImages() {
    this.brief.UploadedFiles.map((file: any, key: number = 0) => {
      if (file.isImage) {
        this.detailsImages.push(new Image(key, { img: file.url, description: `Image ${key + 1}` }));
      }
    });
  }

  openModalViaService(id: number | undefined, index: number) {
    this.galleryService.openGallery(id, index);
  }

  next() {
    this.slides.slideNext();
  }

  prev() {
    this.slides.slidePrev();
  }

  loadBriefMedia(brief: any) {
    this.mediaService.loadMedia(brief);
  }

  async openGallery(uploadedFiles: any) {
    const modal = await this.ModalController.create({
      component: ImageModalComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        uploadedFiles: uploadedFiles
      }
    });
    modal.present();
  }

  viewMembers() {
    this.router.navigate(['/briefs/my-brief/' + this.briefId + '/my-team-members'], { replaceUrl: true });
  }

  viewSolvers() {
    this.router.navigate(['/briefs/my-brief/' + this.briefId + '/participating-solvers'], { replaceUrl: true });
  }

  edit() {
    this.router.navigate(['/briefs/add-brief/edit', this.briefId], { replaceUrl: true });
  }

  back() {
    if (this.navigationService.previousRoute)
      this.router.navigateByUrl(this.navigationService.previousRoute, { replaceUrl: true });
    else this.router.navigate(['/home'], { replaceUrl: true });
  }

  async goToProfile() {
    await this.dataService
      .find('/company-profile', this.brief.ClientId._id)
      .toPromise()
      .then(res => {
        const {
          organization: { _id: organizationId }
        } = res.body;
        this.router.navigate([`/organization/${organizationId}/overview`], { replaceUrl: true });
      });
  }

  async onSlideChange() {
    this.active = await this.slides.getActiveIndex();
    this.activeMobile = await this.slidesMobile.getActiveIndex();
  }

  imageClick(id?: string) {
    this.router.navigate(['/post/details/', id], { replaceUrl: true });
  }

  titleClick(id?: string) {
    this.router.navigate(['/post/details/', id], { replaceUrl: true });
  }

  async subtitleClick(id?: string) {
    let companyId;
    await this.dataService
      .find('/post', id)
      .toPromise()
      .then(async post => {
        companyId = post.body.SupplierId;
        await this.dataService
          .find('/company-profile', companyId)
          .toPromise()
          .then(res => {
            const {
              organization: { _id: organizationId }
            } = res.body;
            this.router.navigate([`/organization/${organizationId}/overview`], { replaceUrl: true });
          });
      });
  }

  async closeBrief() {
    const modal = await this.popover.create({
      component: CloseBriefComponent,
      componentProps: {
        brief: this.brief
      },
      cssClass: 'close-brief'
    });

    modal.onDidDismiss().then(res => {
      this.brief.isActive = res.data;
    });

    modal.present();
  }

  openBrief() {
    this.brief.isActive = true;
    this.dataService
      .update('/brief', this.brief)
      .toPromise()
      .then(() => {});
  }

  fallbackImage(i: number) {
    if (this.briefResponses[i].UploadedFiles) {
      this.briefResponses[i].UploadedFiles[0].url = 'https://picsum.photos/id/122/130/160';
      return this.briefResponses[i].UploadedFiles[0].url;
    }
  }

  ngOnDestroy() {
    this.mediaService.destroyPlayer();
    this.loadingController.dismiss();
  }

  async userActionViewBrief() {
    if (!this.impersonation || this.userRole === 'admin') {
      const userView = new UserAction();
      userView.UserId = this.user.id;
      userView.BriefId = this.briefId;
      userView.Type = 1;
      userView.CompanyId = this.user.company._id;
      await this.dataService.create('/users/user-action', userView).toPromise();
    }
  }
}
