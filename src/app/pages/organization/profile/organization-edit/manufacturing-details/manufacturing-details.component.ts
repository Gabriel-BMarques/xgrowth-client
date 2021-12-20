import { AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '@app/services/data.service';
import { ICity } from '@app/shared/models/city.model';
import { ICountry } from '@app/shared/models/country.model';
import { ILine, Line } from '@app/shared/models/line.model';
import { IOrganization } from '@app/shared/models/organizations.model';
import { IPlant, Plant } from '@app/shared/models/plant.model';
import { IProduct, Product } from '@app/shared/models/product.model';
import { IStateProvince } from '@app/shared/models/state-province.model';
import { isNil } from 'lodash';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-manufacturing-details',
  templateUrl: './manufacturing-details.component.html',
  styleUrls: ['./manufacturing-details.component.scss']
})
export class ManufacturingDetailsComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @Input() isEditing: boolean;
  @Input() viewport: string;
  @Input() section: any;
  @Input() organization: IOrganization;
  @Input() onSave: EventEmitter<any>;
  @Output() closeSection = new EventEmitter<boolean>();

  loading: boolean = true;
  plantDetailsForm: FormGroup;
  countries: ICountry[] = [];
  filteredCountries: Observable<ICountry[]>;
  stateProvinces: IStateProvince[] = [];
  filteredStateProvinces: Observable<IStateProvince[]>;
  cities: ICity[] = [];
  filteredCities: Observable<ICity[]>;
  lineDetails: boolean = false;
  plants: IPlant[] = [];
  lines: ILine[] = [];
  products: IProduct[] = [];
  isEditingLine: boolean = false;
  editingLine: ILine;
  isAddingPlant: boolean;
  isEditingPlant: boolean;
  editingPlantId: string;

  public get plantForm() {
    return this.plantDetailsForm.controls;
  }

  public set plantForm(value: any) {
    this.plantDetailsForm.setValue(value);
  }

  public get lineForm() {
    return this.plantForm.lineDetails.controls;
  }

  public set lineForm(value: any) {
    this.plantForm.lineDetails.setValue(value);
  }

  public get formattedPlant(): IPlant {
    const plant = new Plant();
    plant._id = this.editingPlantId;
    plant.name = this.plantForm.plantName.value;
    plant.address = this.plantForm.address.value;
    plant.country = this.plantForm.country.value._id;
    plant.stateProvinceRegion = this.plantForm.province.value._id;
    plant.city = this.plantForm.city.value._id;
    plant.contact = this.plantForm.contact.value;
    plant.lines = this.lines;
    return plant;
  }

  get formInvalid(): boolean {
    const invalidPlantInfo =
      this.plantDetailsForm.controls.plantName.invalid ||
      this.plantDetailsForm.controls.country.invalid ||
      this.plantDetailsForm.controls.province.invalid ||
      this.plantDetailsForm.controls.city.invalid;

    if (this.lineDetails) {
      return invalidPlantInfo || this.lines.length === 0;
    } else {
      return invalidPlantInfo;
    }
  }

  constructor(private formBuilder: FormBuilder, private dataService: DataService) {
    this.createForm();
    this.filteredCountries = this.plantForm.country.valueChanges.pipe(
      startWith(''),
      map((country: string | null) => (country ? this._filter(country, this.countries) : this.countries.slice()))
    );
    this.filteredStateProvinces = this.plantForm.province.valueChanges.pipe(
      startWith(''),
      map((province: string | null) =>
        province ? this._filter(province, this.stateProvinces) : this.stateProvinces.slice()
      )
    );
    this.filteredCities = this.plantForm.city.valueChanges.pipe(
      startWith(''),
      map((city: string | null) => (city ? this._filter(city, this.cities) : this.cities.slice()))
    );
  }

  ngOnInit(): void {}

  async ngAfterViewInit(): Promise<void> {
    this.loading = true;
    await this.getCountries();
    await this.loadPlants();
    this.onSave.subscribe(async () => {
      await this.loadPlants();
    });
    this.loading = false;
  }

  ngAfterViewChecked() {}

  back() {
    this.section.selected = false;
    this.closeSection.emit(true);
  }

  inputEmpty(formControl: FormControl): boolean {
    return formControl.value === undefined || formControl.value === null || formControl.value === '';
  }

  displayFn(value: any): string {
    return value ? value.name : '';
  }

  switchLineDetails(event: CustomEvent) {
    this.lineDetails = event.detail.value;
  }

  lineProducts(lineId: string): IProduct[] {
    return this.products.filter(p => p.lineId === lineId);
  }

  displayLineDetails(plant: IPlant) {
    plant.linesActive = !plant.linesActive;
  }

  getFormProducts(formProducts: string, line?: ILine): IProduct[] {
    if (isNil(formProducts)) return [];
    const products: IProduct[] = formProducts.split(',').map((pName: string) => {
      let existingProduct: IProduct;
      line?.products?.map(p => {
        if (p.name === pName) existingProduct = p;
      });
      if (!isNil(existingProduct)) return existingProduct;
      const p = new Product();
      p.name = pName.trim().replace(`${/\r?\n|\r/g}`, '');
      p.lineId = line?._id;
      return p;
    });
    return products;
  }

  addPlant() {
    this.isAddingPlant = true;
  }

  editPlant(plant: IPlant) {
    this.loading = true;
    this.isEditingPlant = true;
    this.prepareDataToEdit(plant);
    this.loading = false;
  }

  addLine() {
    this.loading = true;
    const line = new Line();
    line.name = this.plantForm.lineDetails.controls.lineName.value;
    this.lines.push(line);
    this.resetLinesForm();
    this.loading = false;
  }

  editLine(line: ILine) {
    if (this.editingLine) this.lines.push(this.editingLine);
    this.isEditingLine = true;
    this.editingLine = line;
    this.lineForm = {
      lineName: line.name,
      products: line.products.map(p => p.name).join(', ')
    };
    const lineIndex = this.lines.findIndex(l => l.name === line.name);
    this.lines.splice(lineIndex, 1);
  }

  saveLineChanges() {
    this.editingLine.name = this.lineForm.lineName.value;
    this.editingLine.products = this.getFormProducts(this.lineForm.products.value, this.editingLine);
    this.lines.push(this.editingLine);
    this.resetLinesForm();
    this.editingLine = undefined;
    this.isEditingLine = false;
  }

  resetPlantsForm() {
    this.resetLinesForm();
    this.plantDetailsForm.reset();
    this.lines = [];
    this.lineDetails = false;
  }

  resetLinesForm() {
    this.plantDetailsForm.controls.lineDetails.reset();
  }

  prepareDataToEdit(plant: IPlant) {
    this.plantForm = {
      plantName: plant.name || null,
      country: plant.country || null,
      province: plant.stateProvinceRegion || null,
      city: plant.city || null,
      address: plant.address || null,
      contact: plant.contact || null,
      lineDetails: {
        lineName: null
      }
    };
    this.editingPlantId = plant._id;
    this.lines = plant.lines;
    if (this.plantForm.country.invalid) this.plantDetailsForm.controls.province.disable();
    if (this.plantForm.province.invalid) this.plantDetailsForm.controls.city.disable();
    if (this.lines) this.lineDetails = true;
  }

  async getCountries() {
    this.countries = (await this.dataService.list('/misc/country').toPromise()).body;
  }

  async getStates(event?: any, id?: string) {
    const countryId: string = event?.option.value._id || id;
    this.stateProvinces = (
      await this.dataService.list('/misc/state-province', { countryId: countryId }).toPromise()
    ).body;
  }

  async getCities(event?: any, id?: string) {
    const stateProvinceId: string = event?.option.value._id || id;
    this.cities = (await this.dataService.list('/misc/city', { stateProvinceId: stateProvinceId }).toPromise()).body;
  }

  private createForm() {
    this.plantDetailsForm = this.formBuilder.group({
      plantName: [null, Validators.required],
      country: [null, Validators.required],
      province: [null, Validators.required],
      city: [null, Validators.required],
      address: null,
      contact: null,
      lineDetails: this.formBuilder.group({
        lineName: [null, Validators.required]
      })
    });
    this.plantDetailsForm.controls.country.valueChanges.subscribe(value => {
      const foundCountry = this.countries.find(c => c.name === value);
      if (foundCountry) {
        if (!this.stateProvinces?.length) this.getStates(null, foundCountry._id);
        this.plantDetailsForm.controls.country.setValue(foundCountry);
        this.plantDetailsForm.controls.province.enable();
      }
    });
    this.plantDetailsForm.controls.province.valueChanges.subscribe(value => {
      const foundProvince = this.stateProvinces.find(sp => sp.name === value);
      if (foundProvince) {
        if (!this.cities?.length) this.getCities(null, foundProvince._id);
        this.plantDetailsForm.controls.province.setValue(foundProvince);
        this.plantDetailsForm.controls.city.enable();
      }
    });
    this.plantDetailsForm.controls.city.valueChanges.subscribe(value => {
      const foundCity = this.cities.find(c => c.name === value);
      if (foundCity) {
        this.plantDetailsForm.controls.city.setValue(foundCity);
      }
    });
  }

  private _filter(value: string, dataSource: any[]): any[] {
    if (typeof value === 'string') {
      const filterValue = value.toLowerCase();

      return dataSource.filter(element => element.name.toLowerCase().indexOf(filterValue) === 0);
    }
  }

  private async loadPlants() {
    this.plants = (
      await this.dataService.list('/plant/full-structure', { organization: this.organization._id }).toPromise()
    ).body;
    this.plants.forEach(p => (p.linesActive = false));
  }
}
