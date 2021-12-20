import { CredentialsService } from '@app/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MockService } from '@app/services/mock.service';
import { Router, ActivatedRoute, RoutesRecognized } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { IBrief } from '@app/shared/models/brief.model';
import { filter, pairwise } from 'rxjs/operators';
import { IItem, Item } from '@app/shared/models/item.model';
import { PanelData } from '@app/shared/models/panelData.model';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { MatTableDataSource } from '@angular/material/table';
import { PopoverController, IonSlides, ModalController, LoadingController, Events } from '@ionic/angular';
import { BriefModalAcceptComponent } from './brief-modal-accept/brief-modal-accept.component';
import { BriefModalDeclineComponent } from './brief-modal-decline/brief-modal-decline.component';
import { FilesService } from '@app/services/files.service';
import { Image, GalleryService, Description, DescriptionStrategy } from '@ks89/angular-modal-gallery';
import { MediaService } from '@app/services/media.service';
import { ImageModalComponent } from '../../../shared/modals/image-modal/image-modal.component';
import { NotificationService } from '@app/services/notification.service';
import { NavigationService } from '@app/services/navigation.service';
import { UserInfoService } from '@app/services/user-info.service';
import { HttpResponse } from '@angular/common/http';
import { IncompleteOrganizationPopoverComponent } from './incomplete-organization-popover/incomplete-organization-popover.component';
import { UserAction } from '@app/shared/models/userAction.model';
import { IUser } from '@app/shared/models/user.model';

declare let Plyr: any;

@Component({
  selector: 'app-brief-accept',
  templateUrl: './brief-accept.component.html',
  styleUrls: ['./brief-accept.component.scss']
})
export class BriefAcceptComponent implements OnInit {
  @ViewChild('slides') slides: IonSlides;
  @ViewChild('slidesMobile') slidesMobile: IonSlides;

  isLoading = true;
  panelData: PanelData;
  notificationsUser: any[] = [];
  active: number = 0;
  activeMobile: number = 0;
  brief: any;
  briefId: string;
  company: ICompanyProfile;
  category: PanelData;
  briefSupplier: any;
  currentModal: any;
  briefCategories: any[] = [];
  postedOn: Date;
  briefResponses: any[] = [];
  arrayCategories: IItem[] = [];
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };
  previousUrl: string;
  // Trocar variável isAccepted pelo variável de estado do Brief
  isAccepted: boolean;
  isDeclined: boolean;
  isActive: boolean;

  limit: number = 100;
  limitTag = 16;
  truncating = true;
  briefVideos: any[] = [];
  display = false;
  viewAll = false;
  currentCompany: any;
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
  galleryId: number;
  user: IUser;
  impersonation: boolean;
  userRole: string;

  constructor(
    private mockService: MockService,
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute,
    private popover: PopoverController,
    private filesService: FilesService,
    private galleryService: GalleryService,
    private mediaService: MediaService,
    private ModalController: ModalController,
    private notificationService: NotificationService,
    private navigationService: NavigationService,
    private userInfoService: UserInfoService,
    private loadingController: LoadingController,
    public events: Events,
    private popoverController: PopoverController,
    private credentialsService: CredentialsService
  ) {}

  async ngOnInit() {
    const loader = await this.loadingController.create({});
    loader.present();
    this.briefId = this.route.snapshot.params.id;
    this.impersonation = this.credentialsService.credentials.impersonation;
    this.userRole = this.credentialsService.checkRole;
    await this.userInfoService.refreshUserInfo();
    this.user = this.userInfoService.storedUserInfo;
    await Promise.all([this.loadNotifications(), this.refreshData(), this.userActionViewBrief()]);
    this.isLoading = false;
    loader.dismiss();
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
      if (this.notificationsUser[i].briefId) {
        if (this.notificationsUser[i].briefId._id === this.briefId) {
          this.readNotification(this.notificationsUser[i]);
        }
      }
    }
  }

  async ionViewWillEnter() {}

  getPlayerId(index: string, type: string) {
    return `p${index}-${type}`;
  }
  viewAllTags() {
    this.viewAll = !this.viewAll;
  }

  async refreshData() {
    this.currentCompany = this.userInfoService.storedUserInfo.company;

    await this.dataService
      .find('/brief', this.briefId)
      .toPromise()
      .then(brief => {
        this.brief = brief.body;
        const deadline = new Date(new Date(brief.body.Deadline).toUTCString()).getTime();
        const currentDate = new Date(new Date().toUTCString()).getTime();

        if (currentDate > deadline || (this.brief.isActive && this.brief.isActive === false)) {
          this.isActive = false;
        } else {
          this.isActive = true;
        }
      });

    this.brief.createdAt = new Date(this.brief.createdAt).toString();
    this.brief.Deadline = new Date(this.brief.Deadline).toString();
    this.mediaService.getMediaTypes(this.brief);
    this.loadBriefMedia(this.brief);
    this.loadGalleryImages();
    this.generateGalleryId();
    this.postedOn = this.brief.createdAt.toString();

    await this.dataService
      .list('/brief-supplier', { BriefId: this.briefId, SupplierId: this.currentCompany._id })
      .toPromise()
      .then(briefSuppliers => {
        this.briefSupplier = briefSuppliers.body[0];
      });

    if (this.briefSupplier.Accepted === true) {
      this.isAccepted = true;
      this.isDeclined = !this.isAccepted;
    } else if (this.briefSupplier.Accepted === false) {
      this.isAccepted = false;
      this.isDeclined = !this.isAccepted;
    } else {
      this.isAccepted = this.isDeclined = undefined;
    }

    await this.dataService
      .listById('/post/brief/' + this.currentCompany._id, this.briefId)
      .toPromise()
      .then(briefResponses => {
        this.briefResponses = briefResponses.body.filter(briefResponse => {
          return briefResponse.IsDraft !== true;
        });
      });
  }

  generateGalleryId() {
    this.galleryId = Math.floor(Math.random() * 10000);
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

  loadSectionImages(entities: any[]) {
    const videoFormats = ['mp4', 'wmv', 'avi', 'mov'];
    entities.map(entity => {
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
    });
  }

  titleClick(id: string) {
    this.router.navigate(['/post/details/', id], { replaceUrl: true });
  }

  imageClick(id: string) {
    this.router.navigate(['/post/details/', id], { replaceUrl: true });
  }

  async onSlideChange() {
    this.active = await this.slides.getActiveIndex();
    this.activeMobile = await this.slidesMobile.getActiveIndex();
  }

  back() {
    this.router.navigateByUrl('/briefs', { replaceUrl: true });
  }

  ionViewDidEnter() {
    this.navigationService.getRoute(window.location.hash);
    this.navigationService.getPostRoutes(window.location.hash);
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

  loadGalleryImages() {
    this.brief.UploadedFiles.map((file: any, key: number = 0) => {
      if (file.isImage) {
        this.detailsImages.push(new Image(key, { img: file.url, description: `Image ${key + 1}` }));
      }
    });
  }

  async downloadAttachment(fileUrl: string, fileName: string) {
    this.filesService.download(fileUrl, fileName);
  }

  reverseDecline() {
    this.briefSupplier.Accepted = undefined;
    this.isAccepted = this.isDeclined = undefined;
    this.dataService
      .update('/brief-supplier', this.briefSupplier)
      .toPromise()
      .then(() => {});
  }

  openModalViaService(id: number | undefined, index: number) {
    this.galleryService.openGallery(id, index);
  }

  async onAccept() {
    const modal = await this.popover.create({
      component: BriefModalAcceptComponent,
      componentProps: {
        accepted: this.isAccepted,
        briefId: this.briefId
      },
      cssClass: 'brief-modal-accept'
    });

    modal.onDidDismiss().then(acceptance => {
      this.isAccepted = acceptance.data;
      this.briefSupplier.Accepted = acceptance.data;
      this.dataService
        .update('/brief-supplier', this.briefSupplier)
        .toPromise()
        .then(() => {});
    });
    // this.mailService.
    modal.present();
    this.currentModal = modal;
  }

  async onDecline() {
    const modal = await this.popover.create({
      component: BriefModalDeclineComponent,
      componentProps: {
        declined: this.isDeclined
      },
      cssClass: 'brief-modal-decline'
    });

    modal.onDidDismiss().then(decline => {
      this.isDeclined = decline.data;
      if (this.isDeclined === true) {
        this.briefSupplier.Accepted = false;
      } else {
        this.briefSupplier.Accepted = true;
      }
      if (!this.briefSupplier.Accepted) {
        this.notificationService.sendBriefDeclineNotification(this.brief, this.currentCompany);
      }
      this.dataService
        .update('/brief-supplier', this.briefSupplier)
        .toPromise()
        .then(() => {});
    });

    modal.present();
    this.currentModal = modal;
  }

  async addResponse() {
    this.router.navigate(['/briefs/add-response', this.briefId], { replaceUrl: true });
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

  ngOnDestroy() {
    this.mediaService.destroyPlayer();
    this.loadingController.dismiss();
  }

  subtitleClick(id: any) {
    this.router.navigate([`/organization/${id}/overview`], { replaceUrl: true });
  }
}
