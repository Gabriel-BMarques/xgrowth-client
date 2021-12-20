import { Location } from '@angular/common';
import { Component, EventEmitter, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { FilesService } from '@app/services/files.service';
import { HeaderService } from '@app/services/header.service';
import { NavigationService } from '@app/services/navigation.service';
import { UserInfoService } from '@app/services/user-info.service';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { IOrganization } from '@app/shared/models/organizations.model';
import { IUser } from '@app/shared/models/user.model';
import { environment } from '@env/environment';
import { IonContent } from '@ionic/angular';
import { cloneDeep, isNil } from 'lodash';
import { FileUpload } from 'primeng/fileupload';
import { Subject } from 'rxjs';

declare let woopra: any;

@Component({
  selector: 'app-organization-edit',
  templateUrl: './organization-edit.component.html',
  styleUrls: ['./organization-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrganizationEditComponent implements OnInit {
  public get canEdit(): boolean {
    return this.organization.canEdit;
  }

  public get mobileSectionActive(): boolean {
    const hasSelectedSection = this.sections.some(s => s.selected === true);
    return this.viewport === 'mobile' && hasSelectedSection;
  }

  public get footerDisplay(): boolean {
    const mobileCondition = this.viewport === 'mobile' && this.selectedSection.id;
    const desktopCondition = this.viewport === 'desktop';
    const orgOverviewCondition = this.selectedSection.id === 'organizationOverview';
    const orgDetailsCondition = this.selectedSection.id === 'organizationDetails';
    const manufacturingDetailsCondition =
      this.manufacturingDetails?.isAddingPlant || this.manufacturingDetails?.isEditingPlant;
    const productDetailsCondition = this.productDetails?.isAddingProduct || this.productDetails?.isEditingProduct;
    return (
      (mobileCondition || desktopCondition) &&
      (manufacturingDetailsCondition || productDetailsCondition || orgOverviewCondition || orgDetailsCondition) &&
      !this.isLoading
    );
  }

  public get activeTabs() {
    return this.profileTabs.filter(t => t.isActive === true);
  }

  private get manufacturingDetailsSectionVisible(): boolean {
    return this.organization.organizationType?.name === 'External Manufacturer';
  }
  @ViewChild('fileInputLogo', { static: false }) fileInputLogo: FileUpload;
  @ViewChild('fileInputCover', { static: false }) fileInputCover: FileUpload;
  @ViewChild('manufacturingDetails', { static: false }) manufacturingDetails: any;
  @ViewChild('organizationDetails', { static: false }) organizationDetails: any;
  @ViewChild('organizationOverview', { static: false }) organizationOverview: any;
  @ViewChild('productDetails', { static: false }) productDetails: any;
  @ViewChild('userProfile', { static: false }) userProfile: any;
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const windowWidth = event.target.innerWidth;
    this.viewport = windowWidth <= 1024 ? 'mobile' : 'desktop';
    if (this.viewport === 'desktop') this.setDefaultSelectedSection();
  }
  onSave = new EventEmitter<any>();

  // for file manipulation
  isOrgFormSubmitted = false;
  eventFiles: any = {};
  fileUploadProperty = '';
  hasCoverImageChanged = false;
  hasLogoImageChanged = false;

  header: string;
  isLoading = true;
  selectedTabLabel: string;
  organizationId: string;
  organizationCoverImage: any;
  organizationLogoImage: any;
  organization: IOrganization;
  currentUserCompany: ICompanyProfile;
  userInfo: IUser;
  editedUser: IUser;
  isEditing: boolean = true;

  profileTabs: any[] = [
    {
      label: 'Organization profile',
      id: 'organizationProfile',
      isActive: true
    },
    {
      label: 'user-profile',
      id: 'userProfile',
      isActive: true
    }
  ];

  sections: any[] = [
    {
      name: 'organization overview',
      id: 'organizationOverview',
      selected: false,
      visible: true
    },
    {
      name: 'organization details',
      id: 'organizationDetails',
      selected: false,
      visible: true
    },
    {
      name: 'manufacturing details',
      id: 'manufacturingDetails',
      selected: false,
      visible: true
    },
    {
      name: 'products details',
      id: 'productAdd',
      selected: false,
      visible: true
    }
  ];

  selectedSection: any = {};
  viewport: string;
  selectedTabIndex: number;

  get visibleSections(): any[] {
    return this.sections.filter(sec => sec.visible);
  }

  @ViewChild(IonContent, { static: true }) contentArea: IonContent;
  userRole: string;

  constructor(
    private headerService: HeaderService,
    private dataService: DataService,
    private router: Router,
    public route: ActivatedRoute,
    private navigationService: NavigationService,
    private page: Location,
    public userInfoService: UserInfoService,
    private fileService: FilesService
  ) {
    this.userInfoService.setUserInfo();
  }

  ionViewDidEnter() {
    this.headerService.setHeader(this.header);
    this.navigationService.getRoute(window.location.hash);
    this.navigationService.getPostRoutes(window.location.hash);
    this.navigationService.getBriefRouter(window.location.hash);
  }

  loadSectionSelection() {
    if (this.viewport === 'desktop') {
      this.route.queryParams.subscribe(params => {
        console.log('AQUI');
        console.log(params);
        if (params?.mode === 'add-product') {
          this.goToProductAdd();
        } else {
          this.selectedSection = this.sections.find(s => s.name === 'organization overview');
          this.selectedSection.selected = true;
        }
      });
    }
  }

  sectionComplete(section: any) {
    return section.name !== 'products';
  }

  goBack() {
    if (this.navigationService.previousRoute)
      this.router.navigate([this.navigationService.previousRoute], { replaceUrl: true });
    else this.router.navigate(['/home'], { replaceUrl: true });
  }

  closeSection() {
    this.selectedSection = {};
  }

  goToProductsDetailsSection() {
    let productAddSection = this.sections.find(sec => sec.id === 'productAdd');
    this.changeSection(productAddSection);
  }

  fallbackImage(i: number) {
    return true;
  }

  // should only be used for coverImage
  readURL(event: any, property: string): void {
    this.eventFiles = event;
    this.eventFiles.files = event.currentFiles;
    this.fileUploadProperty = property;

    if (event.files && event.files[0]) {
      const file = event.files[0];

      const reader = new FileReader();
      reader.onload = e => {
        this.organization.coverImage.url = reader.result;
      };

      reader.readAsDataURL(file);
    }
  }

  formInvalid(selectedSection: string) {
    if (this.selectedTabLabel === 'user-profile') {
      return this.userProfile.userProfile.invalid;
    }
    switch (selectedSection) {
      case 'organizationOverview':
        return this.organizationOverview?.formInvalid;
      case 'organizationDetails':
        return this.organizationDetails?.formInvalid;
      case 'manufacturingDetails':
        return this.manufacturingDetails?.formInvalid;
      case 'productAdd':
        return this.productDetails?.formInvalid;
      default:
        break;
    }
  }

  goback() {
    this.page.back();
  }

  detectedFormChanges(value: any) {
    this.editedUser = value;
  }

  // tslint:disable-next-line: member-ordering
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
    woopra.track('organization profile view', {
      author: user.email,
      id: user.email,
      name: user.email,
      company: user.company.companyName,
      department: user.department,
      jobTitle: user.jobTitle,
      topic: 'Organization Profile Visualization',
      title: document.title,
      url: window.location.href
    });
  }

  async ngOnInit() {
    this.isLoading = true;
    await this.load();
    this.isLoading = false;
  }

  async ionViewWillEnter() {}

  async switchTab(event: MatTabChangeEvent) {
    this.selectedTabLabel = event.tab.textLabel;
  }

  async navigateToOrganizationProducts() {
    await this.router.navigate(['organization', this.organization._id, 'products']);
  }

  async saveChanges(selectedSection?: string) {
    if (this.selectedTabLabel === 'Organization profile') await this.saveOrganization(selectedSection);
    if (this.selectedTabLabel === 'user-profile') await this.saveUserProfileChanges();
    this.selectedTabIndex = 0;
    this.resetUploadFileState();
  }

  async changeSection(section: any) {
    section.selected = true;
    this.selectedSection = section;
    this.sections.map(s => (s.selected = s.name === section.name));
  }

  async prepareEdition(selectedSection: string) {
    switch (selectedSection) {
      case 'organizationOverview':
        this.organizationOverview.loading = true;
        await this.organizationOverview.loadFormData();
        await this.organizationOverview.prepareDataToEdit(this.organization);
        this.organizationOverview.loading = false;
        break;
      case 'organizationDetails':
        this.organizationDetails.loading = true;
        await this.organizationDetails.loadFormData();
        await this.organizationDetails.prepareDataToEdit(this.organization);
        this.organizationDetails.loading = false;
        break;
      default:
        break;
    }
    this.isOrgFormSubmitted = true;
  }

  async editProfile(selectedSection: string) {
    if (this.viewport === 'desktop') await this.prepareEdition(selectedSection);
  }

  async exitEdition() {
    if (this.manufacturingDetails?.isAddingPlant) {
      this.manufacturingDetails.isAddingPlant = false;
      this.manufacturingDetails.plantDetailsForm.reset();
      return;
    }
    if (this.manufacturingDetails?.isEditingPlant) {
      this.manufacturingDetails.isEditingPlant = false;
      this.manufacturingDetails.plantDetailsForm.reset();
      return;
    }
    if (this.productDetails?.isAddingProduct) {
      this.productDetails.isAddingProduct = false;
      this.productDetails.productAddForm.reset();
      return;
    }
    if (this.productDetails?.isEditingProduct) {
      this.productDetails.isEditingProduct = false;
      this.productDetails.productAddForm.reset();
      return;
    }
    this.router.navigate([`organization/${this.organization._id}/overview`], { replaceUrl: true }).then(() => {
      this.isOrgFormSubmitted = false;
      if (this.selectedSection.id === 'manufacturingDetails') {
        this.manufacturingDetails.resetPlantsForm();
      } else if (this.selectedSection.id === 'productAdd') {
        this.productDetails.addingProductDetails = false;
        this.goToProductsDetailsSection();
      }
      this.organization.coverImage = cloneDeep(this.organizationCoverImage);
      this.organization.logo = cloneDeep(this.organizationLogoImage);
      this.resetUploadFileState();
    });
  }

  async upload(event: any, property: string) {
    switch (property) {
      case 'logo':
        this.organization.logo = await this.fileService.uploadOne(event, this.fileInputLogo);
        this.organizationLogoImage = cloneDeep(this.organization.logo);
        this.hasLogoImageChanged = true;
        break;
      case 'coverImage':
        this.organization.coverImage = await this.fileService.uploadOne(event, this.fileInputCover);
        this.organizationCoverImage = cloneDeep(this.organization.coverImage);
        this.hasCoverImageChanged = true;
        break;
      default:
        break;
    }
  }

  private resetUploadFileState() {
    this.hasLogoImageChanged = false;
    this.organization.coverImage = cloneDeep(this.organizationCoverImage);
    this.hasCoverImageChanged = false;
    this.isOrgFormSubmitted = false;
    this.eventFiles = {};
    this.fileUploadProperty = '';
  }

  private setInitialViewport(width: number) {
    this.viewport = width <= 761 ? 'mobile' : 'desktop';
  }

  private setDefaultSelectedSection() {
    if (!this.selectedSection.id) {
      const defaultSection = this.sections.find(s => s.id === 'organizationOverview');
      defaultSection.selected = true;
      this.selectedSection = defaultSection;
    }
  }

  private loadTabSelection() {
    this.selectedTabIndex = 0;
    this.selectedTabLabel = this.profileTabs[this.selectedTabIndex].label;
  }

  private checkManufacturingSectionVisibility() {
    this.sections.find(sec => sec.id === 'manufacturingDetails').visible = this.manufacturingDetailsSectionVisible;
  }

  private getViewMode(mode: string) {
    switch (mode) {
      case 'edit-org-profile':
        this.selectedTabIndex = 0;
        break;
      case 'edit-user-profile':
        this.selectedTabIndex = 1;
        break;
      default:
        break;
    }
  }

  private goToProductAdd(): void {
    let productDetailsSection = this.sections.find(s => s.id === 'productAdd');
    this.changeSection(productDetailsSection);
  }

  private async saveOrganization(selectedSection: string) {
    console.log(this.hasLogoImageChanged);
    if (this.hasCoverImageChanged || this.hasLogoImageChanged) {
      console.log('caiu aqui', this.organization);
      this.dataService.update('/organization', this.organization).toPromise();
    }

    switch (selectedSection) {
      case 'organizationOverview':
        await this.saveOrganizationOverviewChanges();
        this.router.navigate([`organization/${this.organization._id}/overview`], { replaceUrl: true });
        break;
      case 'organizationDetails':
        await this.saveOrganizationDetailsChanges();
        this.router.navigate([`organization/${this.organization._id}/overview`], { replaceUrl: true });
        break;
      case 'manufacturingDetails':
        await this.saveManufacturingDetailsChanges(this.manufacturingDetails?.isEditingPlant);
        this.manufacturingDetails.plantDetailsForm.reset();
        this.manufacturingDetails.isEditingPlant = this.manufacturingDetails.isAddingPlant = false;
        this.onSave.emit();
        break;
      case 'productAdd':
        await this.productDetails.save();
        this.productDetails.productAddForm.reset();
        this.productDetails.isEditingProduct = this.productDetails.isAddingProduct = false;
        break;
      default:
        break;
    }
    this.isOrgFormSubmitted = true;
  }

  private async saveUserProfileChanges() {
    await this.dataService.updateUser('/users', this.userProfile.prepareDataToSubmit()).toPromise();
    this.editedUser = undefined;
  }

  private async saveManufacturingDetailsChanges(editing: boolean) {
    editing
      ? await this.dataService.update('/plant/full-structure', this.manufacturingDetails?.formattedPlant).toPromise()
      : await this.dataService.create('/plant/full-structure', this.manufacturingDetails?.formattedPlant).toPromise();
  }

  private async saveOrganizationOverviewChanges() {
    const newOrganizationData: IOrganization = this.organizationOverview.organizationOverviewForm.value;
    newOrganizationData._id = this.organization._id;
    await this.dataService.update('/organization', newOrganizationData).toPromise();
  }

  private async saveOrganizationDetailsChanges() {
    const newOrganizationData: IOrganization = this.organizationDetails.organizationDetailsForm.value;
    newOrganizationData._id = this.organization._id;
    await this.dataService.update('/organization', newOrganizationData).toPromise();
    this.organizationDetails.setOrganizationReaches();
  }

  private async load() {
    await Promise.all([
      this.setInitialViewport(window.innerWidth),
      (this.organizationId = this.route.snapshot.params.id),
      (this.userInfo = this.userInfoService.storedUserInfo),
      (this.organization = (await this.dataService.find('/organization', this.organizationId).toPromise()).body),
      this.loadSectionSelection(),
      this.loadTabSelection(),
      this.getViewMode(this.route.snapshot.queryParams.mode)
    ]);
    this.organizationCoverImage = cloneDeep(this.organization.coverImage);
    if (environment.production) this.woopraIdentify(this.userInfo), this.woopraTrack(this.userInfo);
    this.checkManufacturingSectionVisibility();
    this.organizationCoverImage = cloneDeep(this.organization.coverImage);
  }
}
