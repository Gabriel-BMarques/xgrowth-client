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
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '@app/services/data.service';
import { ICountry } from '@app/shared/models/country.model';
import { IOrganization } from '@app/shared/models/organizations.model';
import { ModalController } from '@ionic/angular';
import { isEqual, uniqBy, uniqWith } from 'lodash';
import { ViewMoreModalComponent } from '../../../../../shared/modals/view-more-modal/view-more-modal.component';
import * as AnnualSales from './data-jsons/annualSales.json';
import * as NumberOfEmployees from './data-jsons/numberOfEmployees.json';
import { MatTableDataSource } from '@angular/material/table';
import { FilesService } from '@app/services/files.service';
import { FileUpload } from 'primeng/fileupload';
import { IGlobalRegion } from '@app/shared/models/globalRegion.model';
import { ContactModalComponent } from '@app/shared/modals/contact-modal/contact-modal.component';

@Component({
  selector: 'app-organization-details',
  templateUrl: './organization-details.component.html',
  styleUrls: ['./organization-details.component.scss']
})
export class OrganizationDetailsComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @Input() isEditing: boolean;
  @Input() viewport: string;
  @Input() section: any;
  @Input() organization: IOrganization;
  @Output() closeSection = new EventEmitter<boolean>();
  @ViewChild('uploadedContent', { static: false }) uploadedContent: FileUpload;

  loading: boolean = true;
  regionsReach: ICountry[] = [];
  globalRegions: IGlobalRegion[];
  organizationDetailsForm: FormGroup;
  countries: MatTableDataSource<ICountry>;
  organizationReachSearchParam: string = '';
  annualSales = AnnualSales.default;
  numberOfEmployees = NumberOfEmployees.default;
  currentYear = new Date().getFullYear();

  get hasMoreRegions() {
    return this.regionsReach.length > 6;
  }

  get form() {
    return this.organizationDetailsForm.controls;
  }

  set form(value: any) {
    this.organizationDetailsForm.setValue(value);
  }

  get isUploadingFile(): boolean {
    return this.fileService.isUploadingFile;
  }

  private get organizationRegions(): IGlobalRegion[] {
    const organizationGlobalRegions = this.organization.organizationReach
      .filter(or => or.globalRegion !== undefined)
      .map(or => or.globalRegion);
    const uniqRegions: IGlobalRegion[] = uniqBy(organizationGlobalRegions, '_id');
    return uniqRegions;
  }

  get formInvalid(): boolean {
    return this.organizationDetailsForm.invalid;
  }

  constructor(
    private dataService: DataService,
    private cdRef: ChangeDetectorRef,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private fileService: FilesService
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  async ngAfterViewInit() {
    this.loading = true;
    await this.loadFormData();
    if (this.isEditing) {
      this.prepareDataToEdit(this.organization);
    }
    this.setOrganizationReaches();
    this.loading = false;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
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
    return formControl.value === undefined || formControl.value === null || formControl.value === '';
  }

  searchEmpty(searchParam: string) {
    return searchParam === '';
  }

  includes(object: any, array: any[]) {
    return array.some(el => el._id === object._id);
  }

  regionCountries(globalRegionId: string): ICountry[] {
    return this.countries.data.filter(c => c.globalRegion._id === globalRegionId);
  }

  async upload(event: any) {
    const organizationContent = await this.fileService.uploadOne(event, this.uploadedContent);
    this.form.uploadedContent.setValue(organizationContent);
  }

  deleteFile() {
    this.form.uploadedContent.setValue(null);
  }

  applyFilter(filterValue: string, values: MatTableDataSource<any[]>, debounceTime: number) {
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

  countrySelected(entity: ICountry) {
    return this.organization.organizationReach.some(or => or._id === entity._id);
  }

  globalRegionSelected(entity: IGlobalRegion) {
    const regionCountries = this.countries.data.filter(c => c.globalRegion._id === entity._id);
    const organizationCountries = this.organization.organizationReach.filter(or => or.globalRegion._id === entity._id);
    return regionCountries.length === organizationCountries.length;
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

  prepareDataToEdit(organization: IOrganization) {
    this.form = {
      yearFounded: parseInt(this.organization.yearFounded) >= 0 ? this.organization.yearFounded : null,
      organizationReach: organization.organizationReach.map(or => or._id),
      numberOfEmployees: organization.numberOfEmployees || null,
      annualSales: organization.annualSales || null,
      uploadedContent: organization.uploadedContent || null
    };
    this.prepareCountriesSelection();
    this.prepareGlobalRegionsSelection();
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
    this.countries = new MatTableDataSource((await this.dataService.list('/misc/country').toPromise()).body);
    this.globalRegions = this.getGlobalRegions(this.countries.filteredData);
  }

  private createForm() {
    this.organizationDetailsForm = this.formBuilder.group({
      yearFounded: [undefined, [Validators.max(this.currentYear), Validators.maxLength(4), Validators.min(0)]],
      organizationReach: [undefined, Validators.required],
      numberOfEmployees: undefined,
      annualSales: undefined,
      uploadedContent: undefined
    });
  }

  private getGlobalRegions(countries: ICountry[]): ICountry[] {
    let regions = uniqWith(
      countries.map(c => c.globalRegion),
      isEqual
    );
    return regions;
  }

  private prepareCountriesSelection() {
    this.countries.data.forEach(c => (c.selected = this.countrySelected(c)));
  }

  private prepareGlobalRegionsSelection() {
    this.globalRegions.forEach(gr => (gr.selected = this.globalRegionSelected(gr)));
  }
}
