import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { UserInfoService } from '@app/services/user-info.service';
import { ICountry } from '@app/shared/models/country.model';
import { ILine } from '@app/shared/models/line.model';
import { IOrganization } from '@app/shared/models/organizations.model';
import { IPlant } from '@app/shared/models/plant.model';
import { IProduct } from '@app/shared/models/product.model';
import { FileUpload } from 'primeng/fileupload';
import { BehaviorSubject } from 'rxjs';
import { pluck, tap } from 'rxjs/operators';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  @Input() viewport: string;
  @Input() organization: IOrganization;
  @Input() plantForm: any;
  @Input() section: any;
  @Output() closeSection = new EventEmitter<boolean>();
  @Output() goToManufacturingSection = new EventEmitter<boolean>();

  private _productsSubject$ = new BehaviorSubject<IProduct[]>([]);
  product$ = this._productsSubject$.asObservable();

  loadingProductAdd: boolean = true;
  isExternalManufacturer: boolean = false;
  addingProductDetails: boolean = false;
  isAddingProduct: boolean;
  isEditingProduct: boolean;
  saveProduct: EventEmitter<boolean> = new EventEmitter();

  // form
  productAddForm: FormGroup;

  // select
  plants: IPlant[];
  productionLines: ILine[];
  productMeasuringUnits: string[] = ['g', 'kg', 'ton (metric)', 'oz', 'lb', 'ton (lb)'];
  salesMarkets: ICountry[];

  // images
  @ViewChild('fileInput') fileInput: FileUpload;
  images: any[] = [];

  lines: ILine[] = [];
  plantId: string;
  linesIndex: number = 0;
  productsIndex: number = -1;

  constructor(
    private formBuilder: FormBuilder,
    private userInfoService: UserInfoService,
    private dataService: DataService,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  async ngOnInit(): Promise<void> {
    this.isExternalManufacturer = this.organization?.organizationType?.name === 'External Manufacturer';
    this.loadingProductAdd = true;
    await this.loadFormData();
    this.checkViewMode();
    this.loadProducts();
    this.loadingProductAdd = false;
  }

  async ngAfterViewInit() {}

  checkViewMode() {
    this.route.queryParams.subscribe(params => {
      if (params?.mode === 'add-product') this.isAddingProduct = true;
    });
  }

  loadProducts() {
    this.product$ = this.dataService.list('/product', { organization: this.organization._id }).pipe(
      pluck('body'),
      tap(products => this._productsSubject$.next(products))
    );
  }

  updateProducts() {
    this.product$.subscribe();
  }

  inputEmpty(formControl: FormControl): boolean {
    return (
      formControl.value === undefined ||
      formControl.value === null ||
      formControl.value === '' ||
      !formControl.value.length
    );
  }

  back() {
    this.section.selected = false;
    this.closeSection.emit(true);
    this.goToManufacturingSection.emit();
  }

  async loadFormData() {
    await Promise.all([
      (this.plants = (await this.dataService.list('/plant', { organization: this.organization._id }).toPromise()).body),
      (this.salesMarkets = (await this.dataService.list('/misc/country').toPromise()).body)
    ]);
    if (this.isExternalManufacturer) {
      this.productAddForm.controls['weight'].setValidators([Validators.required, Validators.min(0.01)]);
      this.productAddForm.controls['weight'].updateValueAndValidity();
      this.productAddForm.controls['measuringUnit'].setValidators(Validators.required);
      this.productAddForm.controls['measuringUnit'].updateValueAndValidity();
      this.productAddForm.controls['plant'].setValidators([Validators.required]);
      this.productAddForm.controls['productionLine'].setValidators([Validators.required]);
    } else {
      this.productAddForm.controls['description'].setValidators(Validators.required);
      this.productAddForm.controls['description'].updateValueAndValidity();
    }
  }

  async listPlantLines(plantId: string): Promise<void> {
    this.productionLines = (await this.dataService.list('/line', { plantId }).toPromise()).body;
  }

  upload(event: any) {
    console.log(this.fileInput);
    const fileCount: number = event.files.length;
    let formData;
    if (fileCount > 0) {
      event.files.map((file: any) => {
        formData = new FormData();
        formData.append('file', file);

        this.images.push({
          Name: file.name,
          Size: file.size,
          Type: file.type
            .split('/')
            .pop()
            .toLowerCase()
        });

        const index = this.images.length - 1;

        this.dataService
          .upload('/upload', formData)
          .toPromise()
          .then(res => {
            this.images[index].url = this.getThumbnailImage(res.body.blob).toString();
            this.form.images.setValue(this.images);
          });

        this.fileInput.clear();
      });
    }
  }

  deleteImageOfArray(request: any) {
    this.images = this.images.filter(image => image.url !== request);
    this.form.images.setValue(this.images);
    this.dataService.deleteFile('/upload', [this.getBlobName(request)]).subscribe();
  }

  addProduct() {
    this.isAddingProduct = true;
  }

  deleteProduct() {
    const entity: IProduct = {};
    entity._id = this.form?.productId?.value;
    this.dataService.remove('/product', entity).subscribe(() => this.goToNextProduct());
  }

  doReorder(ev: any) {
    this.images = ev.detail.complete(this.images);
    this.form.uploadedFiles.setValue(this.images);
  }

  getBlobName(url: string) {
    const blobName: string = url.split('https://weleverimages.blob.core.windows.net/app-images/').pop();
    return blobName;
  }

  getThumbnailImage(uploadResponse: string) {
    const image = 'https://weleverimages.blob.core.windows.net/app-images/' + uploadResponse;
    return image;
  }

  cancel() {
    this.back();
  }

  async save() {
    const entity: IProduct = {};
    entity._id = this.form?.productId?.value;
    entity.plantId = this.form?.plant?.value;
    entity.lineId = this.form?.productionLine?.value;
    entity.name = this.form?.productName?.value;
    entity.uploadedFiles = this.form?.images?.value;
    entity.weight = this.form?.weight?.value;
    entity.measuringUnit = this.form?.measuringUnit?.value;
    entity.description = this.form?.description?.value;
    entity.salesMarket = this.form?.salesMarket?.value;
    await this.dataService.create('/product', entity).toPromise();
    console.log('image saved');
    this.images = []; // resets the uploaded image preview after saved;
  }

  get form() {
    return this.productAddForm.controls;
  }

  get formInvalid(): boolean {
    return this.productAddForm?.invalid;
  }

  get isAdmin() {
    return this.userInfoService.storedUserInfo.role === 'admin';
  }

  private breakEdition() {
    this.addingProductDetails = false;
    this.back();
  }

  private goToNextProduct() {
    this.productAddForm.reset();
    this.productAddForm.markAsPristine();
    this.fileInput?.clear();
    this.images = [];
    this.lines[this.linesIndex]?.products?.length - 1 === this.productsIndex
      ? ((this.productsIndex = 0), this.linesIndex++)
      : this.productsIndex++;
    while (this.lines[this.linesIndex]?.products?.length === 0) {
      this.linesIndex++;
      this.productsIndex = 0;
      if (this.lines?.length - 1 < this.linesIndex) {
        this.breakEdition();
        return;
      }
    }
    if (this.lines?.length - 1 < this.linesIndex) {
      this.breakEdition();
      return;
    }
    this.populateForm(this.plantId, this.lines, this.linesIndex, this.productsIndex);
  }

  private populateForm(plantId: string, lines: ILine[], linesIndex: number = 0, productIndex: number = 0): void {
    const product = lines[linesIndex].products[productIndex];
    this.productAddForm.patchValue({
      productId: product._id,
      plant: plantId,
      productionLine: product.lineId,
      productName: product.name,
      weight: product.weight,
      measuringUnit: product.measuringUnit,
      description: product.description,
      salesMarket: product.salesMarket
    });
    if (product.uploadedFiles?.length) {
      const { uploadedFiles } = product;
      this.images = uploadedFiles.map(({ Name, Size, Type, url }) => ({
        Name,
        Size,
        Type: Type.split('/')
          .pop()
          .toLowerCase(),
        url
      }));
      this.form.images.patchValue(this.images);
    }
    this.productAddForm.updateValueAndValidity();
    this.productAddForm.markAsTouched();
  }

  private createForm() {
    this.productAddForm = this.formBuilder.group({
      productId: undefined,
      plant: [undefined],
      productionLine: [undefined],
      productName: [undefined, Validators.required],
      images: undefined,
      weight: [undefined, Validators.min(0.01)],
      measuringUnit: undefined,
      description: [undefined, Validators.maxLength(600)],
      salesMarket: undefined
    });
  }
}
