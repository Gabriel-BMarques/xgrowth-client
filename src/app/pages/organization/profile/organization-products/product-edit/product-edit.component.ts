import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '@app/services/data.service';
import { FilesService } from '@app/services/files.service';
import { UserInfoService } from '@app/services/user-info.service';
import { ICountry } from '@app/shared/models/country.model';
import { ILine } from '@app/shared/models/line.model';
import { IOrganization } from '@app/shared/models/organizations.model';
import { IPlant } from '@app/shared/models/plant.model';
import { IProduct } from '@app/shared/models/product.model';
import { ModalController } from '@ionic/angular';
import { isEmpty, isNil, snakeCase } from 'lodash';
import { FileUpload } from 'primeng/fileupload';
import { throwError } from 'rxjs';
import { catchError, finalize, map, pluck } from 'rxjs/operators';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss']
})
export class ProductEditComponent implements OnInit, AfterViewInit {
  @Input() viewport: string;
  @Input() organization: IOrganization;
  @Input() section: any;
  @Input() product: IProduct;

  @Output() closeSection = new EventEmitter<boolean>();
  @Output() addMore = new EventEmitter<boolean>(false);
  @Output() onProductEdit = new EventEmitter();

  hasAddedProduct = false;

  loadingProductAdd: boolean = true;

  // form
  productAddForm: FormGroup;

  // select
  plants: IPlant;
  productionLines: ILine[];
  productMeasuringUnits: string[] = ['g', 'kg', 'ton (metric)', 'oz', 'lb', 'ton (lb)'];
  salesMarkets: ICountry;

  // images
  @ViewChild('fileInput') fileInput: FileUpload;
  images: any[] = [];

  get isExternalManufacturer(): boolean {
    return this.organization?.organizationType?.name === 'External Manufacturer';
  }

  get form() {
    return this.productAddForm.controls;
  }

  get formInvalid(): boolean {
    return this.productAddForm?.status === 'INVALID';
  }

  get isAdmin() {
    return this.userInfoService.storedUserInfo.role === 'admin';
  }

  constructor(
    private formBuilder: FormBuilder,
    private userInfoService: UserInfoService,
    private dataService: DataService,
    private fileService: FilesService,
    public modalController: ModalController
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.load();
  }

  ngOnDestroy(): void {}

  inputEmpty(formControl: FormControl): boolean {
    const { value } = formControl;
    return isNil(value) || isEmpty(value);
  }

  back() {
    this.closeSection.emit(true);
    this.dismiss();
  }

  dismiss() {
    this.modalController.dismiss({
      dismissed: true,
      product: this.product
    });
  }

  reset(): void {
    this.productAddForm.reset();
  }

  upload(event: any) {
    this.fileService.upload(event, this.images, this.fileInput, this.form.images, 'image');
    // const fileCount: number = event.files.length;
    // let formData;
    // if (fileCount > 0) {
    //   event.files.map((file: any) => {
    //     formData = new FormData();
    //     formData.append('file', file);

    //     this.images.push({
    //       Name: file.name,
    //       Size: file.size,
    //       Type: file.type
    //         .split('/')
    //         .pop()
    //         .toLowerCase()
    //     });

    //     const index = this.images.length - 1;

    //     this.dataService
    //       .upload('/upload', formData)
    //       .toPromise()
    //       .then(res => {
    //         this.images[index].url = this.getThumbnailImage(res.body.blob).toString();
    //         this.form.images.setValue(this.images);
    //       });

    //     this.fileInput.clear();
    //   });
    // }
  }

  deleteImageOfArray(request: any) {
    this.images = this.images.filter(image => image.url !== request);
    this.form.images.setValue(this.images);
    this.dataService.deleteFile('/upload', [this.getBlobName(request)]).subscribe();
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

  save() {
    const entity: IProduct = {};
    (entity._id = this.form._id.value), (entity.plantId = this.form?.plant?.value);
    entity.lineId = this.form?.productionLine?.value;
    entity.name = this.form?.productName?.value;
    entity.uploadedFiles = this.form?.images?.value;
    entity.weight = this.form?.weight?.value;
    entity.measuringUnit = this.form?.measuringUnit?.value;
    entity.description = this.form?.description?.value;
    entity.salesMarket = this.form?.salesMarket?.value;
    this.dataService
      .update('/product', entity)
      .pipe(
        catchError(err => {
          console.log(err.message);
          return throwError(err);
        }),
        pluck('body'),
        map((updatedProduct: IProduct) => (this.product = updatedProduct)),
        finalize(() => {
          this.hasAddedProduct = true;
          this.onProductEdit.emit();
        })
      )
      .subscribe();
  }

  addMoreProducts() {
    this.addMore.emit(true);
    this.hasAddedProduct = false;
    this.productAddForm.reset();
    this.productAddForm.markAsPristine();
    this.fileInput?.clear();
    this.images = [];
  }

  async listPlantLines(plantId: string): Promise<void> {
    this.productionLines = (await this.dataService.list('/line', { plantId }).toPromise()).body;
  }

  async load(): Promise<void> {
    this.loadingProductAdd = true;
    if (this.isExternalManufacturer) {
      this.productAddForm.addControl('plant', this.formBuilder.control(undefined, Validators.required));
      this.productAddForm.addControl('productionLine', this.formBuilder.control(undefined, Validators.required));
    }
    await this.loadFormData();
    this.loadingProductAdd = false;
    this.populateForm(this.product);
  }

  async loadFormData() {
    await Promise.all([
      this.dataService
        .list('/plant', { organization: this.organization._id })
        .toPromise()
        .then((res: any) => (this.plants = res.body)),
      this.dataService
        .list('/misc/country')
        .toPromise()
        .then((res: any) => (this.salesMarkets = res.body))
    ]);
    if (this.isExternalManufacturer) {
      this.productAddForm.controls['weight'].setValidators([Validators.required, Validators.min(0.01)]);
      this.productAddForm.controls['weight'].updateValueAndValidity();
      this.productAddForm.controls['measuringUnit'].setValidators(Validators.required);
      this.productAddForm.controls['measuringUnit'].updateValueAndValidity();
    } else {
      this.productAddForm.controls['description'].setValidators(Validators.required);
      this.productAddForm.controls['description'].updateValueAndValidity();
    }
  }

  private createForm() {
    this.productAddForm = this.formBuilder.group({
      _id: ['', Validators.required],
      productName: [null, Validators.required],
      images: null,
      weight: [null, Validators.min(0.01)],
      measuringUnit: null,
      description: [null, Validators.maxLength(600)],
      salesMarket: null
    });
  }

  private populateForm(product: IProduct | any) {
    this.productAddForm.patchValue({
      _id: this.product._id,
      productName: product.name,
      weight: product.weight,
      measuringUnit: product.measuringUnit,
      description: product?.description,
      salesMarket: product?.salesMarket?.map((sm: any) => sm._id)
    });

    if (this.productAddForm.controls.plant)
      this.productAddForm.controls.plant.setValue(product.plantId?._id || product.plantId);
    if (this.productAddForm.controls.productionLine)
      this.productAddForm.controls.productionLine.setValue(product.lineId?._id || product.lineId);
    if (this.productAddForm.controls.plant?.value) this.listPlantLines(this.productAddForm.controls.plant.value);

    this.productAddForm.updateValueAndValidity();
    this.productAddForm.markAsTouched();
    if (product?.uploadedFiles?.length) {
      const { uploadedFiles } = product;
      this.images = uploadedFiles.map(({ Name, Size, Type, url }: any) => ({
        Name,
        Size,
        Type: Type.split('/')
          .pop()
          .toLowerCase(),
        url
      }));
      this.form.images.patchValue(this.images);
    }
  }
}
