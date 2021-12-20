import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { environment } from '@env/environment';
import { IPost, Post } from '@app/shared/models/post.model';
import { FormGroup } from '@angular/forms';
import { ModalController, IonReorderGroup, NavController, IonSlides, PopoverController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { PostAddWizardService } from '@app/services/post-add-wizard.service';
import { FileUpload } from 'primeng/fileupload';
import { DataService } from '@app/services/data.service';
import { IUploadedFile } from '@app/shared/models/uploadedFile.model';
import { Location } from '@angular/common';
import { debounceTime } from 'rxjs/operators';
import * as _ from 'lodash';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { FilesService } from '@app/services/files.service';
import { MediaService } from '@app/services/media.service';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { NavigationService } from '@app/services/navigation.service';
import { IOrganization } from '@app/shared/models/organizations.model';
import { MatTableDataSource } from '@angular/material/table';
import { ModalValidationComponent } from '@app/shared/modals/modal-validation/modal-validation.component';
import { UserInfoService } from '@app/services/user-info.service';

declare let woopra: any;

@Component({
  selector: 'app-post-add',
  templateUrl: './post-add.component.html',
  styleUrls: ['./post-add.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PostAddComponent implements IAlertControtllerGuard {
  items = [1, 2, 3, 4, 5];
  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;

  @ViewChild('fileInputLogo')
  fileInputLogo: FileUpload;
  @ViewChild('fileInput')
  fileInput: FileUpload;
  header: string;
  isLoading = true;
  isEditing: boolean;
  post: IPost = new Post();
  postInfoForm!: FormGroup;
  currentModal: any;
  postImageFileName: string;
  postImageBase64: string;
  postImagesBase64: [];
  files: any[] = [];
  images: string[] = [];
  imagesUrls: [];
  selectedImage: string;
  delImagesArray: string[] = [];
  file: IUploadedFile;
  id: string;
  filesAux: any[] = [];
  _haveFiles: boolean;
  recipients: any[] = [];
  currentCompany: ICompanyProfile = {};
  cpgCompanies: any[];
  mainMessage: string;
  secondaryMessage: string;

  // potential clients vars
  potentialClients: ICompanyProfile[];
  potentialClientsAux: ICompanyProfile[];
  potentialOrganizations: any[];
  showPotentialClientList: boolean = false;

  // privacies options list
  privacies: any[] = [
    {
      name: 'Potential clients',
      value: 'Potential Clients',
      id: 'potential-client',
      src: '../../../../assets/PotentialClients.svg',
      description: 'Visible to all companies who may need your products or services, CPGs mainly.',
      selected: false,
      isBestOption: true,
      isCurrentSlide: false
    },
    {
      name: 'All companies',
      value: 'All Companies',
      id: 'all-companies',
      src: '../../../../assets/AllCompanies.svg',
      description: 'Reach the largest audience. It will be available for all users in the platform.',
      selected: false,
      isBestOption: false,
      isCurrentSlide: false
    },
    {
      name: 'Targeted companies',
      value: 'Selected Companies',
      id: 'targeted-companies',
      src: '../../../../assets/TargetedCompanies.svg',
      description: 'Sharing exclusive content? Select the company(ies) that can see it.',
      selected: false,
      isBestOption: false,
      isCurrentSlide: false
    },
    {
      name: 'My organization',
      value: 'My Organization',
      id: 'my-organization',
      src: '../../../../assets/MyOrganization.svg',
      description: `Only users from your organization will be able to see this.`,
      selected: false,
      isBestOption: false,
      isCurrentSlide: false
    }
  ];

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    spaceBetween: 10,
    slidesPerView: 1.1,
    centeredSlides: true
  };

  loadingCompanies: boolean = false;
  organizations: IOrganization[];
  companies: ICompanyProfile[];
  organizationData: MatTableDataSource<IOrganization>;
  companyIds: string[] = [];
  allSelected: boolean;
  showTooltipInfo: boolean = false;

  @ViewChild('privacySlider') slides: IonSlides;

  get privacy(): string {
    return this.wizard.step1Form.controls.privacy.value;
  }

  get postId(): string {
    return this.wizard.postId;
  }

  constructor(
    private headerService: HeaderService,
    public wizard: PostAddWizardService,
    public modalController: ModalController,
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute,
    public navCtrl: NavController,
    public location: Location,
    public fileService: FilesService,
    private mediaService: MediaService,
    private navigationService: NavigationService,
    private popover: PopoverController,
    private userInfoService: UserInfoService
  ) {
    this.setHeaderLang();
    this.headerService.setHeader(this.header);
    this.wizard.postId = this.route.snapshot.params.id;
    this.wizard.loadWizard();
  }

  get userInfo(): any {
    return this.userInfoService.storedUserInfo;
  }

  ngAfterViewInit() {
    this.userInfoService.refreshUserInfo();
    this.wizard.currentView = 1;
    this.isLoading = true;
    this.wizard.observableLoading.subscribe(() => {
      this.loadData();
      if (this.postInfoForm.controls.privacy.value) {
        this.switchPrivacy(this.postInfoForm.controls.privacy.value);
      }
      this.isLoading = false;
    });
  }

  async updateCurrentSlide() {
    const activeIndex: number = await this.slides.getActiveIndex();
    this.privacies.forEach((priv, index) => {
      if (index === activeIndex) {
        priv.isCurrentSlide = true;
      } else {
        priv.isCurrentSlide = false;
      }
    });
  }

  async nextPrivacy() {
    await this.slides.slideNext();
    await this.updateCurrentSlide();
  }

  async prevPrivacy() {
    await this.slides.slidePrev();
    await this.updateCurrentSlide();
  }

  toggleTooltipInfo() {
    this.showTooltipInfo = !this.showTooltipInfo;
  }

  checkPrivacy(privacyValue: string) {
    privacyValue === 'Public'
      ? this.postInfoForm.controls.isPublic.setValue(true)
      : this.postInfoForm.controls.isPublic.setValue(false);
  }

  // potential clients methods begin
  togglePotentialClientList() {
    this.showPotentialClientList = !this.showPotentialClientList;
    if (this.showPotentialClientList) {
      this.fetchPotentialClients();
    }
  }

  async fetchPotentialClients() {
    this.loadingCompanies = true;
    this.potentialClients = (await this.dataService.list('/company-profile/potential-clients').toPromise()).body;
    this.potentialClientsAux = this.potentialClients;
    this.setPotentialOrgs();
    this.loadingCompanies = false;
  }

  setPotentialOrgs() {
    this.potentialOrganizations = _.uniqWith(
      this.potentialClients.map(client => client.organization),
      _.isEqual
    );
  }

  searchPotentialClients(filterValue: string) {
    if (filterValue === null) {
      this.potentialClients = this.potentialClientsAux;
      this.setPotentialOrgs();
      return;
    }
    filterValue = filterValue.trim().toLowerCase();
    this.potentialClients = this.potentialClientsAux.filter(
      client =>
        client.companyName
          .trim()
          .toLowerCase()
          .includes(filterValue) ||
        client.organization.name
          .trim()
          .toLowerCase()
          .includes(filterValue)
    );
    this.setPotentialOrgs();
  }
  // potential clients methods end

  async refreshOrganizations() {
    this.loadingCompanies = true;
    await this.dataService
      .list('/company-relation', { companyId: this.wizard.currentCompany._id })
      .toPromise()
      .then(res => {
        const companiesOrganizations = res.body.map(companyRelation => {
          const company = companyRelation.companyA || companyRelation.companyB;
          return company.organization;
        });

        this.organizations = _.uniqWith(companiesOrganizations, _.isEqual);
        this.organizationData = new MatTableDataSource(this.organizations);

        const companies = res.body.map(companyRelation => {
          const company = companyRelation.companyA || companyRelation.companyB;
          return company;
        });

        this.companies = _.uniqWith(companies, _.isEqual);
        this.organizations.map(organization => {
          organization.companies = this.companies.filter(company => {
            return company.organization._id === organization._id;
          });
        });
      });
    this.loadingCompanies = false;
  }

  switchPrivacy(privacyValue: string) {
    this.privacies.forEach(async (priv, index) => {
      if (_.isEqual(priv.value, privacyValue)) {
        priv.selected = true;
        this.checkPrivacy(privacyValue);
        this.postInfoForm.controls.privacy.setValue(priv.value);
        if (priv.value === 'Selected Companies') {
          await this.refreshOrganizations();
          this.prepareSelection();
        }
        setTimeout(() => {
          this.slides.slideTo(index).then(async () => {
            await this.updateCurrentSlide();
          });
        }, 1000);
      } else {
        priv.selected = false;
      }
    });
  }

  prepareSelection() {
    this.companyIds = this.wizard.step1Form.controls.recipientsCompanyProfileId.value;
    this.organizations.map((org: any) => {
      org.companies.map((comp: any) => {
        if (this.companyIds.includes(comp._id)) comp.selected = true;
        else comp.selected = false;
      });
    });

    let found;
    this.organizations.map(org => {
      found = org.companies.some(comp => comp.selected !== true);
    });
    this.allSelected = !found;
  }

  selectCompany(company?: ICompanyProfile) {
    if (company.selected) {
      this.companyIds.push(company._id);
    } else {
      this.companyIds.splice(this.companyIds.indexOf(company._id), 1);
    }
    this.companyIds = _.uniqWith(this.companyIds, _.isEqual);
    this.postInfoForm.controls.recipientsCompanyProfileId.setValue(this.companyIds);
  }

  deselectCompanies() {
    this.organizations.map(organization => {
      organization.companies.map(company => (company.selected = false));
    });
    this.companyIds = [];
    this.postInfoForm.controls.recipientsCompanyProfileId.setValue(this.companyIds);
  }

  toggleAllCompanies() {
    let allCompaniesIDs = this.companies.map(company => company._id);
    if (!this.allSelected) {
      this.deselectCompanies();
    } else {
      this.organizations.map(organization => {
        organization.companies.map(company => (company.selected = true));
      });
      this.companyIds = allCompaniesIDs;
    }
    this.postInfoForm.controls.recipientsCompanyProfileId.setValue(this.companyIds);
  }

  applyFilter(filterValue: string) {
    if (filterValue === null) {
      this.organizationData.filter = '';
    } else {
      this.organizationData.filter = filterValue.trim().toLowerCase();
    }

    if (this.organizationData.paginator) {
      this.organizationData.paginator.firstPage();
    }
  }

  setHeaderLang() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Add New Post';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Adicionar Novo Post';
    }
  }

  loadData() {
    if (environment.production) this.woopraIdentify(this.userInfo), this.woopraTrack(this.userInfo);
    this.postInfoForm = _.cloneDeep(this.wizard.step1Form);
    this.files = this.postInfoForm.controls.uploadedFiles.value;
    this.onChanges();
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
    woopra.track('add new post click', {
      author: user.email,
      id: user.email,
      name: user.email,
      company: user.company.companyName,
      department: user.department,
      jobTitle: user.jobTitle,
      topic: 'Add New Post Click',
      title: document.title,
      url: window.location.href
    });
  }

  woopraTrackCancel(user: any) {
    woopra.track('cancelled new post', {
      author: user.email,
      id: user.email,
      name: user.email,
      company: user.company.companyName,
      department: user.department,
      jobTitle: user.jobTitle,
      topic: 'Cancelled Add New Post',
      title: document.title,
      url: window.location.href
    });
  }

  doReorder(ev: any) {
    this.files = ev.detail.complete(this.files);
    this.postInfoForm.controls.uploadedFiles.setValue(this.files);
  }

  upload(event: any) {
    this.fileService.upload(event, this.files, this.fileInput, this.postInfoForm.controls.uploadedFiles, 'image');
  }

  get haveFiles() {
    if (this.files.length) {
      const urls = this.files.filter(file => {
        return file.url !== undefined;
      });
      if (urls.length < this.files.length) {
        this._haveFiles = false;
      } else {
        this._haveFiles = true;
      }
    } else {
      this._haveFiles = false;
    }
    return this._haveFiles;
  }

  set haveFiles(state: boolean) {
    this._haveFiles = state;
  }

  getBlobName(url: string) {
    const blobName = url.split('https://weleverimages.blob.core.windows.net/app-images/').pop();
    return blobName;
  }

  deleteImageOfArray(request: any) {
    this.selectedImage = request;
    this.files.map((img, index: number = 0) => {
      if (this.selectedImage === img.url) {
        this.delImagesArray.push(this.getBlobName(img.url));
        this.files.splice(index, 1);
        if (this.files.length === 0) {
          this.haveFiles = false;
        }
      }
      index++;
    });
    this.deletePermanently();
  }

  async saveChanges(mode?: string) {
    this.wizard.step1Form = _.cloneDeep(this.postInfoForm);
    await this.wizard.saveChanges();
    if (mode === 'finish') this.router.navigate(['/post/add/preview'], { replaceUrl: true });
  }

  onChanges() {
    this.postInfoForm.controls.name.valueChanges.pipe(debounceTime(1000)).subscribe(async () => {
      this.wizard.step1Form = _.cloneDeep(this.postInfoForm);
      await this.wizard.saveChanges();
    });
    this.postInfoForm.controls.description.valueChanges.pipe(debounceTime(1000)).subscribe(async () => {
      this.wizard.step1Form = _.cloneDeep(this.postInfoForm);
      await this.wizard.saveChanges();
    });
    this.postInfoForm.controls.uploadedFiles.valueChanges.subscribe(async () => {
      this.wizard.step1Form = _.cloneDeep(this.postInfoForm);
      await this.wizard.saveChanges();
    });
  }

  deletePermanently() {
    this.dataService
      .deleteFile('/upload', this.delImagesArray)
      .toPromise()
      .then(res => {
        res.body.map((index: number = 0) => {
          res.body.push(this.delImagesArray[index]);
          index++;
        });
      });
  }

  isVideo(type: string) {
    const videoFormats = ['mp4', 'wmv', 'avi', 'mov'];
    return videoFormats.includes(type);
  }

  getVideoThumbnail(url: string) {
    return this.mediaService.getVideoSource(url, 'thumbnail.png');
  }

  async openPostValidationModal() {
    const modal = await this.popover.create({
      component: ModalValidationComponent,
      componentProps: { mainMessage: this.mainMessage, secondaryMessage: this.secondaryMessage, textButton: 'Ok' },
      cssClass: 'brief-type-modal'
    });

    modal.present();
  }

  postFormValidation() {
    if (!this.haveFiles) {
      this.mainMessage = "You can't move forward without adding the media.";
      this.secondaryMessage = 'Upload it to proceed.';
      return 1;
    } else if (this.postInfoForm.controls.name.invalid) {
      this.mainMessage = "You can't move forward without adding the title.";
      this.secondaryMessage = 'Insert it to proceed.';
      return 1;
    } else if (this.postInfoForm.controls.description.invalid) {
      this.mainMessage = "You can't move forward without adding the description.";
      this.secondaryMessage = 'Insert it to proceed.';
      return 1;
    } else if (this.postInfoForm.controls.privacy.value === 'Selected Companies' && this.companyIds.length < 1) {
      this.mainMessage = "You can't move forward without selecting the company.";
      this.secondaryMessage = 'Select it to proceed.';
      return 1;
    }
    return 0;
  }

  async next() {
    if (this.postFormValidation()) return this.openPostValidationModal();

    this.wizard.step1Form = _.cloneDeep(this.postInfoForm);
    await this.saveChanges();
    if (this.wizard.isEditing) {
      this.router.navigate(['/post', 'add', 'edit', 'add-categories', this.postId]);
    } else {
      this.router.navigate(['/post/add/add-categories'], { replaceUrl: true });
    }
  }

  canDeactivate() {
    if (this.wizard.isEditing) {
      return this.navigationService.generateAlert(
        'Discard Post?',
        'If you leave the post edition now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    } else {
      return this.navigationService.generateAlert(
        'Discard Post?',
        'If you leave the post creation now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    }
  }

  async cancel() {
    if (environment.production) this.woopraIdentify(this.userInfo), this.woopraTrackCancel(this.userInfo);
    this.post = this.wizard.entityCopy;
    this.wizard.reset();
    if (this.post._id !== undefined) {
      await this.dataService
        .update('/post', this.post)
        .toPromise()
        .then(() => {});
      this.router.navigate(['/post', 'details', this.post._id], { replaceUrl: true });
    } else {
      this.router.navigate(['/home'], { replaceUrl: true });
    }
  }
}
