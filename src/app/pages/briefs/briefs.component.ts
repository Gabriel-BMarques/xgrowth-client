import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DataService } from '@app/services/data.service';
import { LoadBriefsService } from '@app/services/load-brief.service';
import { MediaService } from '@app/services/media.service';
import { UserInfoService } from '@app/services/user-info.service';
import { IBrief } from '@app/shared/models/brief.model';
import { environment } from '@env/environment';
import { IonSlides, PopoverController } from '@ionic/angular';
import * as _ from 'lodash';
import { BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { BriefTypeModalComponent } from './add-brief/brief-type-modal/brief-type-modal.component';

declare let woopra: any;

@Component({
  selector: 'app-briefs',
  templateUrl: './briefs.component.html',
  styleUrls: ['./briefs.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BriefsComponent implements OnInit {
  //tutorial
  nextTutorial: number = 0;
  tutorialUser: any;
  hasSeenTutorial: boolean;

  //state management
  isLoading: boolean = true;
  filterOpen: boolean = false;
  optionsOpen: boolean = false;
  isGrid: boolean = true;
  modalSortBy: boolean = false;
  isEmpty: boolean = false;
  incompletedProfile: boolean;
  isCPG: boolean = false;
  filteringActive: boolean = false;
  isFastAccessEmpty: boolean;
  //filter observables
  briefs$ = new BehaviorSubject<any[]>([]);

  //data
  briefs: IBrief[];
  briefsCopy: IBrief[];
  lastViewedBriefs: IBrief[];
  fastAccessBriefs: any;
  lastViewedDate: any;
  sortSelected: String = 'Posting date (newest)';
  briefTypeSelected: any[] = [];
  briefTypes: any[];
  briefsFromStatus: any;
  categories: any;
  arraySubCategories: any[];
  arrayCategories: any[] = [];
  companies: any[];
  markets: any[];
  marketsAux: any[];
  sortOptions: any[] = [
    {
      id: 'brief-sort-title',
      name: 'Sort by',
      value: 'sort by',
      selected: false,
      isTitle: true
    },
    {
      id: 'brief-sort-alphabetical',
      name: 'A - Z',
      value: 'alphabetic',
      selected: false,
      isTitle: false
    },
    {
      id: 'brief-sort-post-newest',
      name: 'Posting date (newest)',
      value: 'newest post',
      selected: false,
      isTitle: false
    },
    {
      id: 'brief-sort-post-oldest',
      name: 'Posting date (oldest)',
      value: 'oldest post',
      selected: false,
      isTitle: false
    },
    {
      id: 'brief-sort-deadline-newest',
      name: 'Deadline date (newest)',
      value: 'newest deadline',
      selected: false,
      isTitle: false
    },
    {
      id: 'brief-sort-deadline-oldest',
      name: 'Deadline date (oldest)',
      value: 'oldest deadline',
      selected: false,
      isTitle: false
    },
    {
      id: 'brief-sort-last-viewed',
      name: 'Last viewed',
      value: 'last viewed',
      selected: false,
      isTitle: false
    }
  ];
  pageTitle: string = 'Fast Access';
  pageTitleSearchTerm: string;
  progressBarresults: any;

  //search & filter form vars
  searchSub$: Subscription;
  filterForm: FormGroup;
  searchForm: FormGroup;
  minPostingDate: Date;
  maxPostingDate: Date;
  minBriefDeadline: Date;
  maxBriefDeadline: Date;
  maxCategories: Number = 5;
  moreCategories: boolean = false;
  maxCompanies: Number = 5;
  moreCompanies: boolean = false;
  isPendingNda: boolean;
  filterByNda: boolean;
  maxDate: Date;
  sentReceivedBriefData: any[] = [
    {
      id: 'briefs-filter-view-all',
      name: 'All',
      value: 'all',
      selected: true
    },
    {
      id: 'briefs-filter-sent',
      name: 'Sent',
      value: 'sent',
      selected: false
    },
    {
      id: 'briefs-filter-received',
      name: 'Received',
      value: 'received',
      selected: false
    }
  ];
  briefStatusData: any[] = [
    {
      id: 'briefs-filter-status-open',
      name: 'Open',
      value: 'open',
      selected: false
    },
    {
      id: 'briefs-filter-status-closed',
      name: 'Closed',
      value: 'closed',
      selected: false
    }
  ];
  // categories
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    slidesPerView: 'auto'
  };
  userInterests: any[];
  categoriesHeader: any[];
  @ViewChild('categoriesSlider') slides: IonSlides;
  disablePrevBtn: boolean = true;
  disableNextBtn: boolean = false;
  filteringByCategoriesActive: boolean = false;
  minCategories: boolean = false;

  constructor(
    private dataService: DataService,
    private popover: PopoverController,
    private userInfoService: UserInfoService,
    private formBuilder: FormBuilder,
    private loadBriefsService: LoadBriefsService,
    private mediaService: MediaService
  ) {
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate());
    this.createForms();
  }

  get userInfo(): any {
    return this.userInfoService.storedUserInfo;
  }

  get lastTutorial(): string {
    if (this.categoriesHeader.length) return 'filter';
    else return 'filter-last';
  }

  get userRole(): string {
    return this.userInfoService.storedUserInfo.role;
  }

  // get hasSeenTutorial(): boolean {
  //   return this.tutorialUser.hasSeenTutorial;
  // }

  get organizationProfileComplete(): string {
    return this.userInfoService.storedUserInfo.organization.isComplete;
  }

  get currentUserCompany(): string {
    return this.userInfoService.storedUserInfo.company;
  }

  get userId(): string {
    return this.userInfoService.storedUserInfo._id;
  }

  onScrollDown() {
    if (this.briefs.length < this.briefsCopy.length) {
      this.briefs = this.briefsCopy.slice(0, this.briefs.length + 15);
      this.briefs$.next(this.briefs);
    }
  }

  async ngOnInit() {
    this.userInfoService.refreshUserInfo();
    this.isLoading = true;
    this.loadUser();
    try {
      await Promise.all([this.getUserInfo(), this.getBriefs(), this.getCategories()]);

      this.getFilterData();

      if (this.categories) this.getCategoriesByBriefs();

      if (this.loadBriefsService.filterForm) this.filterForm = _.cloneDeep(this.loadBriefsService.filterForm);
      if (this.loadBriefsService.searchForm) this.searchForm = _.cloneDeep(this.loadBriefsService.searchForm);
      if (this.loadBriefsService.filterForm || this.loadBriefsService.searchForm) {
        await this.applyFilter();
      } else if (
        this.loadBriefsService.categoriesHeader &&
        this.loadBriefsService.categoriesHeader.some(a => a.active === true)
      ) {
        let index;
        const category = this.loadBriefsService.categoriesHeader.find((cat, i) => {
          if (cat.active) {
            index = i;
            return !!cat.active;
          }
        });
        this.selectInterestCategory(category, index);
      }

      this.isLoading = false;

      this.searchSub$ = this.searchForm.controls.search.valueChanges.pipe(debounceTime(1000)).subscribe(searchTerm => {
        if (!!searchTerm) this.applyFilter();
        else this.clearAll('search');
      });
    } catch (e) {
      console.log(e.message);
    }
  }

  ngOnDestroy() {
    this.searchSub$.unsubscribe();
  }

  organizationLoadingProgressBar($event: any) {
    this.progressBarresults = $event;
  }

  async loadUser() {
    this.tutorialUser = (await this.dataService.getUserInfo().toPromise()).body;
    this.hasSeenTutorial = this.tutorialUser.hasSeenTutorial;
  }

  async tutorialReset() {
    this.nextTutorial = 0;
    this.tutorialUser.hasSeenTutorial = false;
    await this.dataService.updateUser('/users', this.tutorialUser).toPromise();
    await this.loadUser();
  }

  async onNextTutorial(event: any) {
    this.nextTutorial = event.nextTutorial;
    if (this.nextTutorial == 3) this.optionsOpen = true;
    if (this.nextTutorial == 4) this.optionsOpen = false;
    if (this.nextTutorial == 10) {
      this.optionsOpen = false;
      this.tutorialUser.hasSeenTutorial = true;
      await this.dataService.updateUser('/users', this.tutorialUser).toPromise();
      await this.loadUser();
    }
  }

  async getUserInfo() {
    try {
      await this.userInfoService.refreshUserInfo();
      if (
        this.userInfoService.storedUserInfo.organization.organizationType &&
        this.userInfoService.storedUserInfo.organization.organizationType.name === 'CPG'
      )
        this.isCPG = true;
      this.incompletedProfile = !this.userInfoService.storedUserInfo.profileComplete;
    } catch (e) {
      console.log(e.message);
    }
  }

  async getCategories() {
    [this.userInterests] = (
      await Promise.all([this.dataService.list('/interests', { userId: this.userId }).toPromise()])
    ).map(res => res.body);
  }
  // TODO: Filter and search code structure should be refactored as soon as possible
  async getBriefs(filter?: any) {
    if (environment.production) this.woopraIdentify(this.userInfo), this.woopraTrack(this.userInfo);
    this.isLoading = true;
    const query = !!filter ? filter : {};
    [this.briefs, this.fastAccessBriefs] = (
      await Promise.all([
        this.dataService.list('/brief/main-page', query).toPromise(),
        this.dataService.list('/brief/fast-access').toPromise()
      ])
    ).map(res => res.body);

    if (this.searchForm.controls.search.value && this.searchForm.controls.search.value.length) {
      this.briefsCopy = _.cloneDeep(this.briefs);
      this.searchBriefs(this.searchForm.controls.search.value.trim().toLowerCase());
      this.filteringActive = true;
    } else {
    }
    this.loadSectionImages(this.briefs);
    this.briefsCopy = _.cloneDeep(this.briefs);
    this.briefs = this.briefsCopy.slice(0, 15);
    this.briefs$.next(this.briefs);

    if (this.filterByNda) {
      this.briefs = this.briefsCopy.filter((b: any) => !b.sent && !b.isPublic).slice(0, 15);
      this.briefs$.next(this.briefs);
    }

    this.lastViewedDate = this.fastAccessBriefs;
    this.fastAccessBriefs = this.fastAccessBriefs.map((item: any) => item.BriefId);
    this.fastAccessBriefs.length > 0 ? (this.isFastAccessEmpty = false) : (this.isFastAccessEmpty = true);
    this.lastViewedDate.filter((item: any) => delete item.BriefId);

    this.loadSectionImages(this.fastAccessBriefs);

    this.briefsCopy.length < 1 ? (this.isEmpty = true) : (this.isEmpty = false);

    this.isLoading = false;
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
    woopra.track('briefs page view', {
      author: user.email,
      id: user.email,
      name: user.email,
      company: user.company.companyName,
      department: user.department,
      jobTitle: user.jobTitle,
      topic: 'Briefs Page Visualization',
      title: document.title,
      url: window.location.href
    });
  }

  searchBriefs(searchTerm: string) {
    this.briefs = this.briefsCopy.filter((b: any) => {
      const company = b.ClientId.companyName.trim().toLowerCase();
      const title = b.Title.trim().toLowerCase();
      const description = b.Description.trim().toLowerCase();
      const categories = b.Categories.map((c: any) => c.name)
        .join()
        .trim()
        .toLowerCase();
      const organization = b.ClientId.companyName.organization
        ? b.ClientId.companyName.organization.name.trim().toLowerCase()
        : '';
      return (
        company.includes(searchTerm) ||
        organization.includes(searchTerm) ||
        title.includes(searchTerm) ||
        description.includes(searchTerm) ||
        categories.includes(searchTerm)
      );
    });
    this.briefs$.next(this.briefs);
  }

  deleteSearchTerm() {
    this.searchForm.controls.search.reset();
  }
  async getFilterData() {
    this.briefsCopy.map((brief: any) => {
      !brief.isPublic && !brief.sent ? (this.isPendingNda = true) : '';
    });

    const briefTypes = this.briefsCopy.map(brief => brief.type);
    this.briefTypes = _.uniqBy(briefTypes, '_id');
    this.setFormArrayControls(this.briefTypes, 'briefTypes');
    this.categories = _.uniqWith(
      this.briefsCopy.flatMap(brief => brief.Categories),
      _.isEqual
    );
    this.categories.forEach((category: any) => {
      category.subCategories = this.categories.filter((c: any) => c.parentId === category._id);
    });
    this.categories = this.categories.filter((c: any) => !c.parentId);
    this.setFormArrayControls(this.categories, 'categories');

    this.companies = _.uniqWith(
      this.briefsCopy.map(b => b.ClientId),
      _.isEqual
    );
    this.setFormArrayControls(this.companies, 'companies');

    this.markets = _.uniqWith(
      this.briefsCopy.flatMap(brief => brief.Markets),
      _.isEqual
    );
    this.markets = this.markets.map(m => ({ ...m, visible: true }));
    this.markets.sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, { sensitivity: 'accent' }));
    this.marketsAux = this.markets;
  }

  calendarFilter(type: string, event: MatDatepickerInputEvent<Date>) {
    const year = event.value.getFullYear();
    const month = event.value.getMonth();
    const day = event.value.getDate();
    switch (type) {
      case 'startPostingDate':
        return (this.minPostingDate = new Date(year, month, day));

      case 'endPostingDate':
        return (this.maxPostingDate = new Date(year, month, day));

      case 'startBriefDeadLine':
        return (this.minBriefDeadline = new Date(year, month, day));

      case 'endBriefDeadLine':
        return (this.maxBriefDeadline = new Date(year, month, day));
    }
  }

  onFocusOutDateInput(field: string, event: any) {
    if (!event.target.value) {
      this.filterForm.get(field).setErrors(null);
    }
  }

  get allLoaded(): boolean {
    if (!this.isLoading) {
      return this.briefs.length === this.briefsCopy.length;
    }
  }

  scrollInputToTop(topPositonElement: any) {
    var topPos = document.getElementById('briefs-posting-date').offsetTop;
    document.getElementById('briefs-filter-section').scrollTop = topPos - topPositonElement;
  }

  async clearAll(option?: string) {
    await this.getCategoriesByBriefs();
    this.markets = this.marketsAux;
    this.filterByNda = false;
    // reset All/Sent/Received and Brief Status mat-checkbox
    this.sentReceivedBriefsOnChange(0);
    this.briefStatusTypeOnChange('');
    this.pageTitleSearchTerm = '';
    this.pageTitle = 'Fast Access';
    this.filteringByCategoriesActive = false;
    if (option !== 'search') this.searchForm.reset();
    this.loadBriefsService.resetFilterAndSearch();
    await this.getBriefs();
    this.filterForm.reset();
    this.getFilterData();
    this.filteringActive = false;
  }

  async filterByPendingNda() {
    this.filterByNda = !this.filterByNda;

    if (this.filterByNda) {
      this.filteringActive = true;
      this.searchForm.reset();
      this.loadBriefsService.resetFilterAndSearch();
      this.getBriefs();
      this.filterForm.reset();
      this.getFilterData();
    } else {
      this.filteringActive = false;
      await this.clearAll();
    }
  }

  mineOrTeamMember(event: any) {
    const type = event.detail.checked ? 'team-member' : undefined;

    this.filterForm.controls.mineOrTeamMember.setValue(type);
    return;
  }

  sentReceivedBriefsOnChange(optionPosition: number) {
    this.sentReceivedBriefData.map((item: any) => {
      item.selected = false;
    });
    this.sentReceivedBriefData[optionPosition].selected = true;
  }

  sentReceivedBriefs(type: string) {
    this.filterForm.controls.sentOrReceived.setValue(type);
    return;
  }

  briefStatusTypeOnChange(type: string) {
    this.briefStatusData.map((item: any) => {
      item.value === type ? (item.selected = true) : (item.selected = false);
    });
  }

  briefStatusType(type: string) {
    this.filterForm.controls.briefStatus.setValue(type);
    return;
  }

  async addBrief() {
    const modal = await this.popover.create({
      component: BriefTypeModalComponent,
      componentProps: {},
      cssClass: 'brief-type-modal'
    });

    modal.present();
  }

  switchView() {
    this.isGrid = !this.isGrid;
    // should refactor all these briefs assignments to briefs$ as subscriptio
    this.briefs = this.briefs$.getValue();
  }

  async sortBy(option: any) {
    switch (option) {
      case 'alphabetic':
        this.sortAlphabetically();
        this.sortSelected = 'A - Z';
        break;
      case 'newest post':
        this.sortByDate('newest', 'createdAt');
        this.sortSelected = 'Posting date (newest)';
        break;
      case 'oldest post':
        this.sortByDate('oldest', 'createdAt');
        this.sortSelected = 'Posting date (oldest)';
        break;
      case 'newest deadline':
        this.sortByDate('newest', 'Deadline');
        this.sortSelected = 'Deadline date (newest)';
        break;
      case 'oldest deadline':
        this.sortByDate('oldest', 'Deadline');
        this.sortSelected = 'Deadline date (oldest)';
        break;
      case 'last viewed':
        this.isLoading = true;
        this.briefsCopy = this.briefs;
        this.sortSelected = 'Last viewed';
        this.lastViewedBriefs = (await this.dataService.list('/brief/last-viewed').toPromise()).body;
        this.briefsCopy = this.lastViewedBriefs;
        this.briefs = this.briefsCopy.slice(0, 15);
        this.briefs$.next(this.briefs);
        this.isLoading = false;
        break;
      default:
        break;
    }
  }

  sortAlphabetically() {
    this.briefsCopy ? (this.briefs = this.briefsCopy.slice(0, 15)) : '';
    this.briefsCopy && this.briefs$.next(this.briefs);
    return this.briefs.sort((a: any, b: any) =>
      a.Title.toLowerCase() > b.Title.toLowerCase() ? 1 : b.Title.toLowerCase() > a.Title.toLowerCase() ? -1 : 0
    );
  }

  sortByDate(mode: any, sortField: any) {
    this.briefsCopy ? (this.briefs = this.briefsCopy.slice(0, 15)) : '';
    this.briefsCopy && this.briefs$.next(this.briefs);
    if (mode === 'newest')
      return this.briefs.sort((a: any, b: any) => new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime());
    return this.briefs.sort((a: any, b: any) => new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime());
  }
  // form methods below
  private createForms() {
    this.filterForm = this.formBuilder.group({
      sentOrReceived: [''],
      mineOrTeamMember: [''],
      briefTypes: this.formBuilder.array([]),
      categories: this.formBuilder.array([]),
      companies: this.formBuilder.array([]),
      markets: [''],
      minPostingDate: [''],
      maxPostingDate: [''],
      minBriefDeadline: [''],
      maxBriefDeadline: [''],
      briefStatus: ['']
    });
    this.searchForm = this.formBuilder.group({
      search: ['']
    });
  }

  selectCategory(event: any, category: any) {
    const subCategories = category.subCategories?.controls;
    if (!!subCategories) {
      subCategories.forEach((sc: any) => {
        sc.controls.value.setValue(!!event.checked);
      });
    }
  }

  someCompleteCategory(event: any, category: any) {
    const subCategories = category.controls.subCategories.value;
    let someSelected: any;
    let allSelected: any = true;

    if (!!subCategories) {
      subCategories.map((sc: any) => {
        allSelected = sc.value && allSelected;
        someSelected = sc.value || someSelected;
      });
      category.controls.value.setValue(allSelected);
    }
    return someSelected && !allSelected;
  }

  async selectInterestCategory(category: any, index: any) {
    this.filteringByCategoriesActive = !this.categoriesHeader[index].active;

    this.pageTitle = category.name;

    this.categoriesHeader[index].active = !this.categoriesHeader[index].active;

    this.categoriesHeader.forEach(function(item, i) {
      i !== index ? (item.active = false) : '';
    });

    !this.filteringByCategoriesActive ? (this.pageTitle = 'Fast Access') : '';

    this.briefs = this.briefsCopy
      .filter((brief: IBrief) => {
        return (
          brief.Categories.map((cat: any) => cat._id)
            .join()
            .includes(category._id.toString()) && brief.isPublic
        );
      })
      .slice(0, 15);
    this.briefs$.next(this.briefs);
    if (!this.filteringByCategoriesActive) await this.clearAll();
  }

  loadBriefsFromObservable() {
    this.briefs = this.briefs$.getValue();
  }

  async getCategoriesByBriefs() {
    this.categoriesHeader = this.categories.filter((cat: any) =>
      this.userInterests.some((inte: any) => cat._id === inte.categoryId)
    );
    this.categoriesHeader.forEach(function(item) {
      item.active = false;
    });
    this.minCategories = this.categoriesHeader.length > 2;
  }

  searchMarkets(searchTerm: string) {
    if (searchTerm && searchTerm.length) {
      this.markets = this.marketsAux.map(mkt => ({
        ...mkt,
        visible: mkt.name
          .trim()
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase())
      }));
      return;
    }

    this.markets = this.marketsAux;
  }

  async applyFilter() {
    this.filteringActive = true;
    this.filterOpen = false;
    const filterObject: any = {};
    const briefTypes = this.filterForm.controls.briefTypes.value.flatMap((bt: any) => (bt && bt.value ? bt._id : []));
    const companies = this.filterForm.controls.companies.value.flatMap((company: any) =>
      company && company.value ? company._id : []
    );

    const categories = this.filterForm.controls.categories.value.flatMap((categ: any) =>
      categ && categ.value ? categ._id : []
    );

    const subCategories = this.filterForm.controls.categories.value.flatMap((categ: any) =>
      categ && categ.subCategories && categ.subCategories.length
        ? categ.subCategories.flatMap((subC: any) => (subC.value ? subC._id : []))
        : []
    );

    filterObject['type._id'] = briefTypes;
    filterObject.ClientId = companies;
    filterObject.Categories = [...categories, ...subCategories];
    filterObject.sentOrReceived = this.filterForm.controls.sentOrReceived.value;
    filterObject.mineOrTeamMember = this.filterForm.controls.mineOrTeamMember.value;
    filterObject.Markets = this.filterForm.controls.markets.value;

    filterObject.minPostingDate = this.filterForm.controls.minPostingDate.value;
    filterObject.maxPostingDate = this.filterForm.controls.maxPostingDate.value;
    filterObject.minBriefDeadline = this.filterForm.controls.minBriefDeadline.value;
    filterObject.maxBriefDeadline = this.filterForm.controls.maxBriefDeadline.value;

    filterObject.isActive = this.filterForm.controls.briefStatus.value
      ? this.filterForm.controls.briefStatus.value === 'open'
        ? true
        : false
      : undefined;

    Object.keys(filterObject).forEach(key =>
      filterObject[key] === undefined ||
      filterObject[key] === '' ||
      filterObject[key] === null ||
      filterObject[key] === []
        ? delete filterObject[key]
        : {}
    );

    this.loadBriefsService.filterForm = _.cloneDeep(this.filterForm);
    this.loadBriefsService.searchForm = _.cloneDeep(this.searchForm);

    this.pageTitleSearchTerm = this.searchForm.controls.search.value;
    await this.getBriefs(filterObject);
  }

  setFormArrayControls(dataArray: any[], arrayName: string) {
    let entitiesFGs;
    if (arrayName === 'categories') {
      entitiesFGs = dataArray.map(entity => {
        if (entity) {
          let subCategory;
          let subCategories;
          if (entity.subCategories && entity.subCategories.length) {
            subCategories = entity.subCategories.map((sub: any) => {
              subCategory = {
                label: [sub.name],
                _id: [sub._id],
                value: [false]
              };
              return this.formBuilder.group(subCategory);
            });
          }
          const category = {
            label: [entity.name],
            _id: [entity._id],
            parentId: [entity.parentId || undefined],
            subCategories: subCategories ? this.formBuilder.array(subCategories || undefined) : undefined,
            value: [false],
            clicked: [false]
          };
          return this.formBuilder.group(category);
        }
      });
    } else {
      entitiesFGs = dataArray.map(entity => {
        if (entity) {
          const obj = {
            label: [entity.name || entity.companyName],
            _id: [entity._id],
            value: [false]
          };
          return this.formBuilder.group(obj);
        }
      });
    }

    const entityFormArray = this.formBuilder.array(entitiesFGs);
    this.filterForm.setControl(`${arrayName}`, entityFormArray);
  }

  arrowVisibility() {
    let isBeg = this.slides.isBeginning();
    let isEnd = this.slides.isEnd();

    Promise.all([isBeg, isEnd]).then(data => {
      data[0] ? (this.disablePrevBtn = true) : (this.disablePrevBtn = false);
      data[1] ? (this.disableNextBtn = true) : (this.disableNextBtn = false);
    });
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

  next() {
    this.slides.slideNext();
  }

  prev() {
    this.slides.slidePrev();
  }

  reachedEnd() {
    this.disableNextBtn = true;
  }

  get briefTypesField() {
    return this.filterForm.controls.briefTypes as FormArray;
  }

  get categoriesField() {
    return this.filterForm.controls.categories as FormArray;
  }

  get companiesField() {
    return this.filterForm.controls.companies as FormArray;
  }
}
