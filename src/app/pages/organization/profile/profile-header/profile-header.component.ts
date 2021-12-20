import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationService } from '@app/services/navigation.service';
import { IOrganization } from '@app/shared/models/organizations.model';
import { PopoverController } from '@ionic/angular';
import { cloneDeep } from 'lodash';
import { FileUpload } from 'primeng/fileupload';
import { SharePopoverComponent } from './share-popover/share-popover.component';
import { UserInfoService } from '@app/services/user-info.service';
import { FilesService } from '@app/services/files.service';

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.scss']
})
export class ProfileHeaderComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild('fileInputLogo', { static: false }) fileInputLogo: FileUpload;
  @ViewChild('fileInputCover', { static: false }) fileInputCover: FileUpload;

  @Input() organization: IOrganization | any = {};
  @Input() isEditing: boolean = false;
  @Input() canEdit: boolean = false;
  @Input() viewport: string;
  @Input() selectedSection: any = {};
  @Input() isOrgFormSubmitted = false;
  @Input() path: string;
  @Input() set changeCoverImage(hasChanged: boolean) {
    this.hasCoverImageChanged = hasChanged;
    this.coverImageChanges.emit(this.hasCoverImageChanged);
  }
  @Output() fileCoverInputChanges: EventEmitter<any> = new EventEmitter<any>();
  @Output() editProfileEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() coverImageChanges: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() logoImageChanges: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() fileChanges: EventEmitter<any> = new EventEmitter<any>();
  @Output() fileUploadPropertyChanges: EventEmitter<any> = new EventEmitter<any>();
  @Output() organizationChanges = new EventEmitter<any>();

  // for file manipulation
  eventFiles: any = {};
  fileUploadProperty = '';
  hasCoverImageChanged: boolean;
  organizationCoverImage: any = {};
  url: string = window.location.href;
  defaultBackRoute: string;

  navigationPaths: any[] = [];

  get overviewPage(): boolean {
    let path = this.route.snapshot.url[1].path;
    return path === 'overview';
  }

  get changeCoverImage(): boolean {
    return this.hasCoverImageChanged;
  }

  get isMyOrganization() {
    if (this.organization) {
      return this.organization.id === this.userInfoService.storedUserInfo.organization._id;
    }
  }

  constructor(
    private navigationService: NavigationService,
    private router: Router,
    public popoverController: PopoverController,
    private route: ActivatedRoute,
    private userInfoService: UserInfoService,
    private cdRef: ChangeDetectorRef,
    private fileService: FilesService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.organizationCoverImage = cloneDeep(this.organization.coverImage);
    this.defaultBackRoute = this.overviewPage ? `solvers` : `organization/${this.organization._id}/overview`;
    this.navigationPaths = this.navigationPaths
      .concat([
        {
          path: this.organization.organizationType?.name || 'Not defined',
          class: 'navigate-active',
          route: 'solvers',
          routeParams: { organizationType: [this.organization.organizationType?._id] }
        },
        {
          path: this.organization.subType?.name,
          class: 'navigate-active',
          route: 'solvers',
          routeParams: {
            organizationType: [this.organization.organizationType?._id],
            subType: [this.organization.subType?._id]
          }
        },
        {
          path: this.organization.name,
          class: this.path ? 'navigate-active' : 'navigate-disabled',
          route: `organization/${this.organization._id}/overview`
        },
        {
          path: this.path,
          class: 'navigate-disabled',
          route: null
        }
      ])
      .filter(navPath => navPath.path !== undefined);
  }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  ngOnChanges(changes: any) {
    const hasOrgFormSubmitted = changes.isOrgFormSubmitted?.currentValue;
    if (hasOrgFormSubmitted) {
      this.resetUploadFileState();
    }
  }

  goBack() {
    if (this.navigationService.previousRoute)
      this.router.navigate([this.navigationService.previousRoute], { replaceUrl: true });
    else this.router.navigate(['/home'], { replaceUrl: true });
  }

  fallbackImage(i: number) {
    return true;
  }

  // should only be used for coverImage
  readURL(event: any, property: string): void {
    const eventFiles = event;
    eventFiles.files = event.currentFiles;
    this.fileUploadProperty = property;
    this.changeCoverImage = true;

    // if (event.files && event.files[0]) {
    //   const file = event.files[0];

    //   const reader = new FileReader();
    //   reader.onload = e => {
    //     this.organization.coverImage.url = reader.result;
    //   };

    //   reader.readAsDataURL(file);
    // }
    this.fileChanges.emit(eventFiles);
    this.fileUploadPropertyChanges.emit(this.fileUploadProperty);
    this.fileCoverInputChanges.emit(this.fileInputCover);
  }

  goBackToSolversPage(): void {
    this.router.navigate(['/solvers'], { replaceUrl: true });
  }

  navigate(route: string, routeParams: any): void {
    if (route) this.router.navigate([route], { replaceUrl: true, queryParams: routeParams });
  }

  async editProfile(selectedSection: string) {
    this.editProfileEvent.emit(selectedSection);
    await this.router.navigate(['organization', this.organization._id, 'edit'], {
      replaceUrl: true,
      queryParams: { isEditing: true, mode: 'edit-org-profile' }
    });
  }

  async presentSharePopover(ev: any) {
    const popover: HTMLIonPopoverElement = await this.popoverController.create({
      component: SharePopoverComponent,
      componentProps: { url: this.url, organization: this.organization, dismiss: () => popover.dismiss() },
      cssClass: 'share-organization-popover',
      event: ev,
      showBackdrop: false,
      translucent: true
    });
    await popover.present();
    await popover.onDidDismiss();
  }

  private resetUploadFileState() {
    this.organization.coverImage = cloneDeep(this.organizationCoverImage);
    this.changeCoverImage = false;
    this.isOrgFormSubmitted = false;
    this.eventFiles = {};
    this.fileUploadProperty = '';

    this.fileChanges.emit(this.eventFiles);
    this.coverImageChanges.emit(this.hasCoverImageChanged);
  }

  async upload(event: any, property: string) {
    switch (property) {
      case 'logo':
        this.organization.logo = await this.fileService.uploadOne(event, this.fileInputLogo);
        this.logoImageChanges.emit(true);
        break;
      case 'coverImage':
        this.organization.coverImage = await this.fileService.uploadOne(event, this.fileInputCover);
        this.coverImageChanges.emit(true);
        break;
      default:
        break;
    }
  }
}
