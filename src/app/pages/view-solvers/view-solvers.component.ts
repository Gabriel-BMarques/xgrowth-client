import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { UserInfoService } from '@app/services/user-info.service';
import * as _ from 'lodash';
import { ModalReferSolverComponent } from '@app/shared/modals/modal-refer-solver/modal-refer-solver.component';
import { environment } from '@env/environment';
import { ModalController } from '@ionic/angular';
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime } from 'rxjs/operators';

declare let woopra: any;
@Component({
  selector: 'view-solvers',
  templateUrl: './view-solvers.component.html',
  styleUrls: ['./view-solvers.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ViewSolversComponent implements OnInit {
  //state management
  filterOpen: boolean = false;
  modalSortBy: boolean = false;
  filteringActive: boolean = false;
  isEmpty: boolean = false;
  solversLoading = true;
  nextTutorial: number = 0;
  viewTutorial = false;
  closeTutorial: number = 10; // number that jumps all steps and trigger event to end tutorials
  loadingMore: boolean;

  // filter data
  searchForm: FormGroup;
  filterForm: FormGroup;
  organizationType: any;
  subType: any;
  segments: any;
  certifications: any;
  organizationReach: any;
  countriesSI: any;
  locationsSI: any;
  filterObject: any = {};
  maxOrgType: Number = 5;
  maxOrgSegment: Number = 5;
  maxOrgCertification: Number = 5;
  moreOrgType: boolean = false;
  moreOrgSegment: boolean = false;
  moreOrgCertification: boolean = false;

  // data
  solvers: any = [];
  solversCopy: any;
  userCompany: any;
  sortOptions: any[] = [
    {
      id: 'solver-sort-title',
      name: 'Sort by',
      value: 'sort by',
      selected: false,
      isTitle: true
    },
    {
      id: 'solver-sort-alphabetical',
      name: 'A - Z',
      value: 'alphabetic',
      selected: false,
      isTitle: false
    },
    {
      id: 'solver-sort-desc-alphabetical',
      name: 'Z - A',
      value: 'descending alphabetical',
      selected: false,
      isTitle: false
    },
    {
      id: 'solver-sort-number-posts',
      name: 'Number of posts',
      value: 'number of posts',
      selected: false,
      isTitle: false
    },
    {
      id: 'solver-sort-last-added',
      name: 'Last added to XGrowth',
      value: 'last added',
      selected: false,
      isTitle: false
    }
  ];
  sortSelected: string = 'A - Z';
  loadingFilter: boolean;
  loadingPage: boolean;
  loadingFilteredData: boolean;

  get hasSearchTerm() {
    return (
      this.searchForm.value.search !== undefined &&
      this.searchForm.value.search !== '' &&
      this.searchForm.value.search !== null
    );
  }

  get userRole(): string {
    return this.userInfoService.storedUserInfo.role;
  }

  get userInfo(): any {
    return this.userInfoService.storedUserInfo;
  }

  get organizationTypeField() {
    return this.filterForm.controls.organizationType as FormArray;
  }

  get segmentsField() {
    return this.filterForm.controls.segments as FormArray;
  }

  get certificationsField() {
    return this.filterForm.controls.certifications as FormArray;
  }

  get globalRegions() {
    if (this.countriesSI) {
      let uniqGlobalRegion = _.uniqWith(
        this.countriesSI.filteredData.map((or: any) => or.globalRegion),
        _.isEqual
      );
      uniqGlobalRegion = _.uniqBy(uniqGlobalRegion, '_id');
      return uniqGlobalRegion;
    }
  }

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private userInfoService: UserInfoService,
    private modalController: ModalController,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  applyFilterInput(filterValue: string, values: MatTableDataSource<any[]>) {
    if (filterValue === null) {
      values.filter = '';
    } else {
      values.filter = filterValue.trim().toLowerCase();
    }
  }

  woopraTrack(user: any) {
    woopra.track('solvers view', {
      author: user.email,
      id: user.email,
      name: user.email,
      company: user.company.companyName,
      department: user.department,
      jobTitle: user.jobTitle,
      topic: 'Solvers Visualization',
      title: document.title,
      url: window.location.href
    });
  }

  setFormArrayControls(dataArray: any[], arrayName: string) {
    let entitiesFGs;
    if (arrayName === 'organizationType') {
      entitiesFGs = dataArray.map(entity => {
        if (entity) {
          let subType;
          let secOrgTypes;
          if (entity.subTypes && entity.subTypes.length) {
            secOrgTypes = entity.subTypes.map((sec: any) => {
              subType = {
                label: [sec.name],
                _id: [sec._id],
                value: [false]
              };
              return this.formBuilder.group(subType);
            });
          }
          const organizationType = {
            label: [entity.name],
            _id: [entity._id],
            parentId: [entity.parentId || undefined],
            secOrgTypes: secOrgTypes ? this.formBuilder.array(secOrgTypes || undefined) : undefined,
            value: [false],
            clicked: [false]
          };
          return this.formBuilder.group(organizationType);
        }
      });
    } else {
      entitiesFGs = dataArray.map(entity => {
        if (entity) {
          const obj = {
            label: [entity.name],
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

  someCompleteOrgType(event: any, orgType: any) {
    const secOrgTypes = orgType.controls.secOrgTypes.value;
    let someSelected: any;
    let allSelected: any = true;

    if (!!secOrgTypes) {
      secOrgTypes.map((sc: any) => {
        allSelected = sc.value && allSelected;
        someSelected = sc.value || someSelected;
      });
      orgType.controls.value.setValue(allSelected);
    }
    return someSelected && !allSelected;
  }

  selectOrgType(event: any, orgType: any) {
    const secOrgTypes = orgType.secOrgTypes?.controls;
    if (!!secOrgTypes) {
      secOrgTypes.forEach((sc: any) => {
        sc.controls.value.setValue(!!event.checked);
      });
    }
  }

  goToSolverProfile(id: string) {
    this.router.navigate(['/organization', id, 'overview'], { replaceUrl: true });
  }

  toggleCountries(region: any) {
    region.selected = !region.selected;
    const regionCountries = this.countriesSI.data.filter((c: any) => c.globalRegion._id === region._id);
    let selectedCountries = this.filterForm.controls.organizationReach.value;

    if (!selectedCountries) {
      selectedCountries = [];
    }

    if (region.selected) {
      const newCountries = _.uniqWith(selectedCountries.concat(regionCountries.map((c: any) => c._id)), _.isEqual);
      this.filterForm.controls.organizationReach.setValue(newCountries);
    } else {
      selectedCountries = selectedCountries.filter((sc: any) => !regionCountries.map((c: any) => c._id).includes(sc));
      this.filterForm.controls.organizationReach.setValue(selectedCountries);
    }
  }

  selectLineCountries(region: any) {
    region.selected = !region.selected;
    const regionCountries = this.locationsSI.data.filter((c: any) => c.globalRegion._id === region._id);
    let selectedCountries = this.filterForm.controls.lineLocation.value;

    if (!selectedCountries) {
      selectedCountries = [];
    }

    if (region.selected) {
      const newCountries = _.uniqWith(selectedCountries.concat(regionCountries.map((c: any) => c._id)), _.isEqual);
      this.filterForm.controls.lineLocation.setValue(newCountries);
    } else {
      selectedCountries = selectedCountries.filter((sc: any) => !regionCountries.map((c: any) => c._id).includes(sc));
      this.filterForm.controls.lineLocation.setValue(selectedCountries);
    }
  }

  applySearch(filterObject: any): void {
    filterObject.searchParam = this.searchForm.value.search;
  }

  includes(object: any, array: any[]) {
    return array.some(el => el._id === object._id);
  }

  deleteSearchTerm() {
    this.searchForm.controls.search.reset();
  }

  resetTutorial() {
    this.viewTutorial = true;
    this.nextTutorial = 0;
  }

  getRouteParamsFilter(): void {
    this.filteringActive = true;
    let paramsFilter = this.route.snapshot.queryParams;
    this.filterObject = paramsFilter;
  }

  async sortBy(option: any) {
    this.sortSelected = this.sortOptions.find(so => so.value === option).name;
    await this.getFilteredSolvers();
  }

  async referSolver() {
    const popover = await this.modalController.create({
      component: ModalReferSolverComponent,
      cssClass: 'refer-solver-modal'
    });
    popover.present();
    popover.onDidDismiss().then((modalRes: any) => {});
  }

  async getFilteredSolvers() {
    this.loadingFilteredData = true;
    this.filteringActive = true;
    this.filterOpen = false;
    this.solvers = [];
    const filterObject: any = {};

    const organizationType = this.filterForm.controls.organizationType.value.flatMap((orgType: any) =>
      orgType && orgType.value ? orgType._id : []
    );

    const secOrgTypes = this.filterForm.controls.organizationType.value.flatMap((subOrg: any) =>
      subOrg && subOrg.secOrgTypes && subOrg.secOrgTypes.length
        ? subOrg.secOrgTypes.flatMap((subC: any) => (subC.value ? subC._id : []))
        : []
    );
    const segments = this.filterForm.controls.segments.value.flatMap((bt: any) => (bt && bt.value ? bt._id : []));
    const certifications = this.filterForm.controls.certifications.value.flatMap((company: any) =>
      company && company.value ? company._id : []
    );

    filterObject.sort = this.sortSelected;
    filterObject.organizationType = [...organizationType];
    filterObject.subType = [...secOrgTypes];
    filterObject.segments = segments;
    filterObject.certifications = certifications;
    filterObject.organizationReach = this.filterForm.controls.organizationReach.value;
    filterObject.lineLocation = this.filterForm.controls.lineLocation.value;

    Object.keys(filterObject).forEach(key =>
      filterObject[key] === undefined ||
      filterObject[key] === '' ||
      filterObject[key] === null ||
      filterObject[key] === []
        ? delete filterObject[key]
        : {}
    );

    if (this.hasSearchTerm) this.applySearch(filterObject);
    this.filterObject = filterObject;
    await this.getSolvers();

    this.loadingFilteredData = false;
  }

  async clearAll() {
    this.searchForm.reset();
    this.filterForm.reset();
    this.filteringActive = false;
    await Promise.all([this.getFilterData(), this.getSolvers()]);
  }

  async ngOnInit() {
    try {
      if (this.route.snapshot.queryParams) this.getRouteParamsFilter();
      await Promise.all([this.getSolvers(), this.getFilterData()]);
      if (environment.production) this.woopraTrack(this.userInfo);
    } catch (e) {
      console.log(e.message);
    }
  }

  async ionViewWillEnter() {
    this.userInfoService.refreshUserInfo();
  }

  async onScrollDown() {
    await this.getSolvers();
  }

  async getSolvers() {
    this.solversLoading = true;
    this.solvers = this.solvers.concat(
      (
        await this.dataService
          .list(`/company-relation/organizations?skip=${this.solvers.length}`, this.filterObject)
          .toPromise()
      ).body.map((solver: any) => {
        solver.hasTruncatedWhoWeAre = true;
        solver.hasTruncatedSkills = true;
        solver.hasTruncatedCertifications = true;
        solver.hasTruncatedSegments = true;
        solver.hasTruncatedSubSegments = true;
        solver.readLessSubSegments = false;
        solver.readLessSegments = false;
        solver.readLessWhoWeAre = false;
        solver.readLessSkills = false;
        solver.readLessCertifications = false;
        solver.isAllEmpty =
          (!solver.segments?.length || solver.segments == null) &&
          (!solver.subsegments?.length || solver.subsegments == null) &&
          (!solver.skills?.length || solver.skills == null) &&
          (solver.whoWeAre === '' || solver.whoWeAre == null);
        return solver;
      })
    );
    this.isEmpty = this.solvers?.length < 1;
    this.solversLoading = false;
  }

  async getFilterData() {
    this.loadingFilter = true;
    const data = await Promise.all([
      this.dataService.list('/organization/organization-type').toPromise(),
      this.dataService.listAll('/segments').toPromise(),
      this.dataService.list('/organization/organization-type/sub-type').toPromise(),
      this.dataService.list('/organization/certification').toPromise()
    ]);
    [this.organizationType, this.segments, this.subType, this.certifications] = data.map(d => d.body);

    const dataReach = await Promise.all([this.dataService.list('/misc/country').toPromise()]);
    [this.countriesSI] = dataReach.map(d => new MatTableDataSource(d.body));

    this.locationsSI = this.countriesSI;

    this.organizationType = this.organizationType.concat(this.subType);
    this.organizationType.forEach((orgType: any) => {
      orgType.subTypes = this.organizationType.filter((secOrg: any) => secOrg.parentId === orgType._id);
    });

    this.organizationType = this.organizationType.filter((secOrg: any) => !secOrg.parentId);

    // Set Controls
    this.setFormArrayControls(this.organizationType, 'organizationType');
    this.setFormArrayControls(this.segments, 'segments');
    this.setFormArrayControls(this.certifications, 'certifications');

    this.loadingFilter = false;
  }

  async onNextTutorial(event: any) {
    this.nextTutorial = event.nextTutorial;
    if (this.nextTutorial == 2) this.filterOpen = true;
    if (this.nextTutorial == 3) this.filterOpen = false;
    if (this.nextTutorial == this.closeTutorial) {
      this.viewTutorial = false;
      this.nextTutorial = 0;
    }
  }

  private createForm() {
    this.filterForm = this.formBuilder.group({
      organizationType: this.formBuilder.array([]),
      segments: this.formBuilder.array([]),
      certifications: this.formBuilder.array([]),
      organizationReach: [''],
      lineLocation: ['']
    });
    this.searchForm = this.formBuilder.group({
      search: ['']
    });
    this.searchForm.controls.search.valueChanges.pipe(debounceTime(1000)).subscribe(value => {
      this.getFilteredSolvers();
    });
  }
}
