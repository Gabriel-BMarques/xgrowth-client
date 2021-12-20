import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '@app/services/data.service';
import { CategoryOrganization, ICategoryOrganization } from '@app/shared/models/categoryOrganization.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'modal-page',
  templateUrl: './modalCategory.component.html',
  styleUrls: ['./modalCategory.component.scss']
})
export class ModalCategoryComponent implements OnInit {
  // Receiving information
  @Input() name: string;
  @Input() description: string;
  @Input() categoryOrganization: any;

  responseInfoForm!: FormGroup;
  newCategoryOrganization: ICategoryOrganization;
  isLoading = true;
  selectedSegment: any;
  segmentsSI: any;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) {
    this.createForms();
  }

  async ngOnInit() {
    this.isLoading = false;
    await this.dataService
      .listAll('/segments')
      .toPromise()
      .then(res => {
        this.segmentsSI = res.body;
      });

    if (this.categoryOrganization) {
      this.responseInfoForm.controls.name.setValue(this.categoryOrganization.name);
      this.responseInfoForm.controls.segment.setValue(this.categoryOrganization.segment._id);
      this.responseInfoForm.controls.isPublic.setValue(this.categoryOrganization.isPublic);
    }
  }

  isValid() {
    if (this.responseInfoForm.touched || this.responseInfoForm.invalid) {
      return false;
    } else {
      return true;
    }
  }

  submit() {
    // if contains a segment, update
    if (this.categoryOrganization) {
      this.categoryOrganization.name = this.form.name.value;
      this.categoryOrganization.segment = this.form.segment.value;
      this.categoryOrganization.isPublic = this.form.isPublic.value;
      this.dataService
        .update('/category-organization', this.categoryOrganization)
        .toPromise()
        .then(res => {
          this.categoryOrganization.segment = this.form.segment.value;
          this.categoryOrganization.isPublic = this.form.isPublic.value;
          this.modalController.dismiss(this.categoryOrganization);
        });
    } else {
      this.prepareDataToSubmit();
      this.dataService
        .create('/category-organization', this.newCategoryOrganization)
        .toPromise()
        .then(res => {
          this.newCategoryOrganization = res.body;
          this.isLoading = false;
          this.modalController.dismiss(this.newCategoryOrganization);
        });
    }
  }

  prepareDataToSubmit() {
    this.newCategoryOrganization = new CategoryOrganization();
    this.newCategoryOrganization.name = this.form.name.value;
    this.newCategoryOrganization.segment = this.form.segment.value;
    this.newCategoryOrganization.isPublic = this.form.isPublic.value;
  }

  toggleAccept() {}
  private createForms() {
    this.responseInfoForm = this.formBuilder.group({
      name: ['', Validators.required],
      segment: ['', Validators.required],
      isPublic: [false]
    });
  }

  cancel() {
    this.modalController.dismiss();
  }

  get form() {
    return this.responseInfoForm.controls;
  }
}
