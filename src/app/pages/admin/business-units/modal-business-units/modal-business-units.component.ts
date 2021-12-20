import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '@app/services/data.service';
import { BusinessUnit, IBusinessUnit } from '@app/shared/models/businessUnit.model';
import { ICountry } from '@app/shared/models/country.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-business-units',
  templateUrl: './modal-business-units.component.html',
  styleUrls: ['./modal-business-units.component.scss']
})
export class ModalBusinessUnitsComponent implements OnInit {
  @Input() businessUnits: any;
  responseInfoForm!: FormGroup;
  newBunisessUnit: IBusinessUnit;
  companySI: any;
  countriesSI: any;
  isLoading = true;
  organizationId: any;
  organization: any;
  companyId: any;

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
      .listAll('/company-profile')
      .toPromise()
      .then(res => {
        this.companySI = res.body;
      });
    await this.dataService
      .list('/misc/country')
      .toPromise()
      .then(res => {
        this.countriesSI = res.body;
      });

    if (this.businessUnits) {
      this.responseInfoForm.controls.name.setValue(this.businessUnits.name);
      this.responseInfoForm.controls.countries.setValue(this.businessUnits.countries);
      this.responseInfoForm.controls.company.setValue(this.businessUnits.company);
      this.getOrganization(this.businessUnits.company);
    }
  }

  submit() {
    //update
    if (this.businessUnits) {
      this.businessUnits.name = this.form.name.value;
      this.businessUnits.countries = this.form.countries.value;
      this.businessUnits.company = this.form.company.value;
      this.businessUnits.organization = this.organization._id;
      this.dataService
        .update('/businessUnit', this.businessUnits)
        .toPromise()
        .then(res => {
          this.businessUnits.segment = this.form.company.value;
          this.businessUnits.isPublic = this.form.organization.value;
          this.modalController.dismiss(this.businessUnits);
        });
    } else {
      this.prepareDataToSubmit();
      this.dataService
        .create('/businessUnit', this.newBunisessUnit)
        .toPromise()
        .then(res => {
          this.newBunisessUnit = res.body;
          this.isLoading = false;
          this.modalController.dismiss(this.newBunisessUnit);
        });
    }
  }

  prepareDataToSubmit() {
    this.newBunisessUnit = new BusinessUnit();
    this.newBunisessUnit.name = this.form.name.value;
    this.newBunisessUnit.countries = this.form.countries.value;
    this.newBunisessUnit.company = this.form.company.value;
    this.newBunisessUnit.organization = this.organization._id;
  }

  isValid() {
    if (this.responseInfoForm.touched || this.responseInfoForm.invalid) {
      return false;
    } else {
      return true;
    }
  }

  getOrganization(event: any) {
    if (event.value) {
      this.companyId = event.value;
      this.dataService
        .find('/company-profile', this.companyId)
        .toPromise()
        .then(res => {
          const { organization } = res.body;
          const organizationName = organization.name;
          this.organization = organization;
          this.form.organization.setValue(organizationName);
          this.form.organization.disable();
        });
    } else {
      this.companyId = event;
      this.dataService
        .find('/company-profile', this.companyId)
        .toPromise()
        .then(res => {
          const { organization } = res.body;
          const organizationName = organization.name;
          this.organization = organization;
          this.form.organization.setValue(organizationName);
          this.form.organization.disable();
        });
    }
  }

  private createForms() {
    this.responseInfoForm = this.formBuilder.group({
      name: ['', Validators.required],
      countries: ['', Validators.required],
      company: ['', Validators.required],
      organization: ['', Validators.required]
    });
  }

  cancel() {
    this.modalController.dismiss();
  }

  get form() {
    return this.responseInfoForm.controls;
  }
}
