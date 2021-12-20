import { ICountry } from '@app/shared/models/country.model';
import { IGlobalRegion } from '@app/shared/models/globalRegion.model';
import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { UserInfoService } from '@app/services/user-info.service';
import { ICertification } from '@app/shared/models/certifications.model';
import { IInitiative } from '@app/shared/models/initiative.model';
import { IOrganization } from '@app/shared/models/organizations.model';
import { IOrganizationType } from '@app/shared/models/organizationType.model';
import { ISegment } from '@app/shared/models/segment.model';
import { ISkill } from '@app/shared/models/skill.model';
import { ModalController } from '@ionic/angular';
import { isEqual, uniqWith, uniqBy } from 'lodash';
import { ViewMoreModalComponent } from '../../../../../shared/modals/view-more-modal/view-more-modal.component';
import { ContactModalComponent } from '@app/shared/modals/contact-modal/contact-modal.component';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-organization-overview',
  templateUrl: './organization-overview.component.html',
  styleUrls: ['./organization-overview.component.scss']
})
export class OrganizationOverviewComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @Input() isEditing: boolean;
  @Input() viewport: string;
  @Input() section: any;
  @Input() organization: IOrganization;
  @Output() closeSection = new EventEmitter<boolean>();

  loading: boolean = true;
  organizationOverviewForm: FormGroup;
  segments: MatTableDataSource<ISegment>;
  subSegments: MatTableDataSource<ISegment>;
  skills: MatTableDataSource<ISkill>;
  certifications: MatTableDataSource<ICertification>;
  initiatives: MatTableDataSource<IInitiative>;
  organizationTypes: MatTableDataSource<IOrganizationType>;
  organizationSubTypes: MatTableDataSource<IOrganizationType>;
  countries: MatTableDataSource<ICountry>;
  regionsReach: ICountry[] = [];
  organizationReachSearchParam: string = '';
  globalRegions: IGlobalRegion[];

  get hasOverflowSkills(): boolean {
    const skillsParentDiv = document.getElementById('skillsParentDiv');
    const skillsChildDiv = document.getElementById('skillsChildDiv');
    if (skillsChildDiv && skillsParentDiv) return skillsChildDiv.offsetHeight > skillsParentDiv.offsetHeight;
  }

  get form() {
    return this.organizationOverviewForm.controls;
  }

  set form(value: any) {
    this.organizationOverviewForm.setValue(value);
  }

  get organizationTypeDisabled(): boolean {
    return this.userInfoService.storedUserInfo.role === 'admin';
  }

  get startupTypeDisabled(): boolean {
    return this.userInfoService.storedUserInfo.role === 'admin';
  }

  get formInvalid(): boolean {
    if (!this.hasSubType) {
      return (
        this.organizationOverviewForm.controls.organizationType.invalid ||
        this.organizationOverviewForm.controls.name.invalid ||
        this.organizationOverviewForm.controls.segments.invalid ||
        this.organizationOverviewForm.controls.subSegments.invalid ||
        this.organizationOverviewForm.controls.skills.invalid ||
        this.organizationOverviewForm.controls.skills.invalid
      );
    }
    return this.organizationOverviewForm.invalid;
  }

  get filteredSubSegments(): ISegment[] {
    return this.subSegments.filteredData.filter(ss => this.form.segments.value.includes(ss.parentId._id));
  }

  get filteredSkills(): ISkill[] {
    return this.skills.filteredData.filter(sk => this.form.subSegments.value.includes(sk.segment._id));
  }

  get selectedSegments() {
    return uniqWith(
      this.filteredSubSegments.map(ss => ss.parentId),
      isEqual
    );
  }

  get selectedSubSegments() {
    return uniqWith(
      this.filteredSkills.map(ss => ss.segment),
      isEqual
    );
  }

  get organizationTypeSubTypes() {
    return this.organizationSubTypes?.filteredData?.filter(st => st.parentId === this.form.organizationType?.value);
  }

  get hasSubType() {
    const foundType = this.organizationTypes?.filteredData?.find(ot => ot._id === this.form.organizationType?.value)
      ?.name;
    return foundType === 'Startup';
  }

  get isStartup() {
    const foundType = this.organizationTypes?.filteredData?.find(ot => ot._id === this.form.organizationType?.value)
      ?.name;
    return foundType === 'Startup';
  }

  get isAdmin() {
    return this.userInfoService.storedUserInfo.role === 'admin';
  }

  private get organizationRegions(): IGlobalRegion[] {
    const organizationGlobalRegions = this.organization.organizationReach
      .filter(or => or.globalRegion !== undefined)
      .map(or => or.globalRegion);
    const uniqRegions: IGlobalRegion[] = uniqBy(organizationGlobalRegions, '_id');
    return uniqRegions;
  }

  constructor(
    private modalController: ModalController,
    private cdRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private userInfoService: UserInfoService,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  back() {
    this.section.selected = false;
    this.closeSection.emit(true);
  }

  viewMore(items: any[], type: string, modalTitle: string) {
    this.modalController
      .create({
        component: ViewMoreModalComponent,
        cssClass: 'view-more-modal',
        componentProps: {
          items,
          type,
          modalTitle
        }
      })
      .then(modal => modal.present());
  }

  inputEmpty(formControl: FormControl): boolean {
    return (
      formControl.value === undefined ||
      formControl.value === null ||
      formControl.value === '' ||
      !formControl.value.length
    );
  }

  setOrganizationReaches(): void {
    this.regionsReach = this.organizationRegions.map(gr => {
      const regionCountries = this.countries.data.filter(c => c.globalRegion._id === gr._id);
      const organizationCountries = this.organization.organizationReach.filter(or => or.globalRegion._id === gr._id);
      const entireRegion = regionCountries.length === organizationCountries.length;
      entireRegion ? (gr.reachLevel = 'Entire region') : (gr.reachLevel = 'Partially');
      return gr;
    });
  }

  haveItems(items: any[]): boolean {
    return items !== undefined && items.length > 0;
  }

  applyFilter(filterValue: string, values: MatTableDataSource<any[]>) {
    if (filterValue === null) {
      values.filter = '';
    } else {
      values.filter = filterValue.trim().toLocaleLowerCase();
    }
  }

  applyFilterOrgReach(filterValue: string, values: MatTableDataSource<any[]>, debounceTime: number) {
    this.organizationReachSearchParam = filterValue.trim().toLocaleLowerCase();
    setTimeout(() => {
      if (filterValue === null) {
        values.filter = '';
      } else {
        values.filter = this.organizationReachSearchParam;
      }
      this.globalRegions = this.getGlobalRegions(this.countries.filteredData);
    }, debounceTime);
  }

  toggleSubsegments(event: any, segmentId: string) {
    if (event.checked) this.selectSubSegments(segmentId);
    else this.deselectSubSegments(segmentId);
  }

  toggleSkills(event: any, subSegmentId: string) {
    if (event.checked) this.selectSkills(subSegmentId);
    else this.deselectSkills(subSegmentId);
  }

  allSubSegmentsSelected(segmentId: string) {
    const segmentSubSegments = this.subSegments.data.filter(ss => ss.parentId._id === segmentId).map(ss => ss._id);
    const selectedSubSegments = this.form.subSegments.value?.filter((ss: string) => {
      return segmentSubSegments.includes(ss);
    });
    return segmentSubSegments.length === selectedSubSegments?.length;
  }

  allSkillsSelected(subSegmentId: string) {
    const subSegmentSkills = this.skills.data.filter(ss => ss.segment._id === subSegmentId).map(ss => ss._id);
    const selectedSkills = this.form.skills.value?.filter((ss: string) => {
      return subSegmentSkills.includes(ss);
    });
    return subSegmentSkills.length === selectedSkills?.length;
  }

  addKeyPressController(elementId: string) {
    const interval = setInterval(() => {
      const input = document.getElementById(elementId);
      if (input) {
        input.onkeydown = event => {
          if (event.which < 0x20) {
            return;
          } else if (this.form.whoWeAre.value.length === 600) {
            event.preventDefault();
          } else {
            setTimeout(() => {
              if (this.form.whoWeAre.errors?.maxlength)
                this.form.whoWeAre.setValue(this.form.whoWeAre.value.substring(0, 600));
            }, 500);
          }
        };
        clearInterval(interval);
      }
    }, 100);
  }

  toggleGlobalRegion(region: IGlobalRegion) {
    region.selected = !region.selected;
    const regionCountries = this.countries.data.filter(c => c.globalRegion._id === region._id);
    let selectedCountries = this.form.organizationReach.value || [];
    region.selected
      ? this.selectRegionCountries(selectedCountries, regionCountries)
      : this.desselectRegionCountries(selectedCountries, regionCountries);
  }

  toggleCountry(country: ICountry, globalRegion: IGlobalRegion) {
    country.selected = !country.selected;
    let selectedCountries = this.form.organizationReach.value;
    country.selected
      ? this.selectCountry(selectedCountries, country)
      : this.desselectCountry(selectedCountries, country, globalRegion);
  }

  selectCountry(selectedCountries: string[], country: ICountry) {
    country.selected = true;
    selectedCountries.push(country._id);
    this.form.organizationReach.setValue(selectedCountries);
  }

  desselectCountry(selectedCountries: string[], country: ICountry, globalRegion: IGlobalRegion) {
    country.selected = false;
    const index = selectedCountries.findIndex(sc => sc === country._id);
    selectedCountries.splice(index, 1);
    this.form.organizationReach.setValue(selectedCountries);
    if (globalRegion.selected) globalRegion.selected = false;
  }

  selectRegionCountries(selectedCountries: string[], regionCountries: ICountry[]) {
    const newCountries = uniqWith(
      selectedCountries.concat(
        regionCountries.map(c => {
          c.selected = true;
          return c._id;
        })
      ),
      isEqual
    );
    this.form.organizationReach.setValue(newCountries);
  }

  desselectRegionCountries(selectedCountries: string[], regionCountries: ICountry[]) {
    selectedCountries = selectedCountries.filter(
      (sc: any) =>
        !regionCountries
          .map(c => {
            c.selected = false;
            return c._id;
          })
          .includes(sc)
    );
    this.form.organizationReach.setValue(selectedCountries);
  }

  countrySelected(entity: ICountry) {
    return this.organization.organizationReach.some(or => or._id === entity._id);
  }

  globalRegionSelected(entity: IGlobalRegion) {
    const regionCountries = this.countries.data.filter(c => c.globalRegion._id === entity._id);
    const organizationCountries = this.organization.organizationReach.filter(or => or.globalRegion._id === entity._id);
    return regionCountries.length === organizationCountries.length;
  }

  searchEmpty(searchParam: string) {
    return searchParam === '';
  }

  regionCountries(globalRegionId: string): ICountry[] {
    return this.countries.data.filter(c => c.globalRegion._id === globalRegionId);
  }

  includesF(object: any, array: any[]) {
    return array.some(el => el._id === object._id);
  }

  prepareDataToEdit(organization: IOrganization) {
    this.form = {
      organizationType: organization.organizationType?._id || null,
      organizationReach: organization.organizationReach.map(or => or._id),
      subType: organization.subType?._id || null,
      name: organization.name,
      website: organization.website || null,
      segments: organization.segments.map(seg => seg._id),
      subSegments: organization.subSegments.map(subSeg => subSeg._id),
      skills: organization.skills.map(sk => sk._id),
      certifications: organization.certifications.map(c => c._id),
      initiatives: organization.initiatives.map(i => i._id),
      whoWeAre: organization.whoWeAre || null
    };
    this.prepareCountriesSelection();
    this.prepareGlobalRegionsSelection();
    if (!this.isAdmin) {
      this.form.name.disable();
    }
    this.addKeyPressController('whoWeAre');
  }

  handleOrgTypeChange(event: MatSelectChange): void {
    let hasSubTypes = this.organizationSubTypes.data.filter(st => st.parentId === event.value);
    if (!hasSubTypes.length) this.form.subType.setValue(null);
  }

  async ngAfterViewInit() {
    this.loading = true;
    if (this.isEditing) {
      await this.loadFormData();
      this.prepareDataToEdit(this.organization);
    }
    // if there are no skills in the database, remove the form from view
    if (!this.skills || !this.skills.data.length) {
      this.organizationOverviewForm.get('skills').clearValidators();
    }
    this.organizationOverviewForm.get('skills').updateValueAndValidity();

    this.loading = false;
  }

  async openContactModal(modalTitle: string, receiverEmail: string): Promise<void> {
    (
      await this.modalController.create({
        cssClass: 'contact-modal',
        component: ContactModalComponent,
        componentProps: {
          modalTitle,
          receiverEmail
        }
      })
    ).present();
  }

  async loadFormData() {
    const data = await Promise.all([
      this.dataService.list('/segments').toPromise(),
      this.dataService.list('/segments/sub-segment').toPromise(),
      this.dataService.list('/skills').toPromise(),
      this.dataService.list('/organization/certification').toPromise(),
      this.dataService.list('/organization/initiative').toPromise(),
      this.dataService.list('/organization/organization-type').toPromise(),
      this.dataService.list('/organization/organization-type/sub-type').toPromise()
    ]);
    [
      this.segments,
      this.subSegments,
      this.skills,
      this.certifications,
      this.initiatives,
      this.organizationTypes,
      this.organizationSubTypes
    ] = data.map(d => new MatTableDataSource(d.body));
    this.countries = new MatTableDataSource((await this.dataService.list('/misc/country').toPromise()).body);
    this.globalRegions = this.getGlobalRegions(this.countries.filteredData);
  }

  private getGlobalRegions(countries: ICountry[]): ICountry[] {
    let regions = uniqWith(
      countries.map(c => c.globalRegion),
      isEqual
    );
    return regions;
  }

  private createForm() {
    this.organizationOverviewForm = this.formBuilder.group({
      organizationType: new FormControl({ value: undefined }, Validators.required),
      organizationReach: [undefined, Validators.required],
      subType: new FormControl({ value: undefined }, Validators.required),
      name: new FormControl({ value: undefined }, Validators.required),
      website: undefined,
      segments: [undefined, Validators.required],
      subSegments: [undefined, Validators.required],
      skills: [undefined, Validators.required],
      certifications: undefined,
      initiatives: undefined,
      whoWeAre: [undefined, Validators.maxLength(600)]
    });
  }

  private selectSubSegments(segmentId: string) {
    const subSegmentsToSelect = this.filteredSubSegments.filter(ss => ss.parentId._id === segmentId).map(ss => ss._id);
    const selectedSubSegments = this.form.subSegments.value.concat(subSegmentsToSelect);
    this.form.subSegments.setValue(selectedSubSegments);
  }

  private deselectSubSegments(segmentId: string) {
    const subSegmentsToDeselect = this.filteredSubSegments
      .filter(ss => ss.parentId._id === segmentId)
      .map(ss => ss._id);
    const selectedSubSegments = this.form.subSegments.value.filter((ss: string) => {
      return !subSegmentsToDeselect.includes(ss);
    });
    this.form.subSegments.setValue(selectedSubSegments);
  }

  private selectSkills(subSegmentId: string) {
    const skillsToSelect = this.filteredSkills.filter(ss => ss.segment._id === subSegmentId).map(ss => ss._id);
    const selectedSkills = this.form.skills.value.concat(skillsToSelect);
    this.form.skills.setValue(selectedSkills);
  }

  private deselectSkills(subSegmentId: string) {
    const skillsToDeselect = this.filteredSkills.filter(ss => ss.segment._id === subSegmentId).map(ss => ss._id);
    const selectedSkills = this.form.skills.value.filter((ss: string) => {
      return !skillsToDeselect.includes(ss);
    });
    this.form.skills.setValue(selectedSkills);
  }

  private prepareCountriesSelection() {
    this.countries.data.forEach(c => (c.selected = this.countrySelected(c)));
  }

  private prepareGlobalRegionsSelection() {
    this.globalRegions.forEach(gr => (gr.selected = this.globalRegionSelected(gr)));
  }
}
