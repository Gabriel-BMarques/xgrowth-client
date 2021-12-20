import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '@app/services/data.service';
import { IOrganization } from '@app/shared/models/organizations.model';
import { IUser } from '@app/shared/models/user.model';
import { ModalController } from '@ionic/angular';
import { ChangePasswordModalComponent } from './change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
  // encapsulation: ViewEncapsulation.None
})
export class UserProfileComponent implements OnInit {
  @Input() userInfo: any;
  @Input() categories: any;
  @Output() userChanges: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private modalController: ModalController
  ) {
    this.createForm();
  }

  userProfile!: FormGroup;
  firstName: string;
  familyName: string;
  email: string;
  department: string;
  country: any;
  position: string;
  businessUnitsSI: any;
  companiesSI: any;
  countriesSI: any;
  departmentsSI: any;
  jobTitlesSI: any;
  categoryOfUserSI: any;
  allUserInformation: any;
  userOrganization: IOrganization;
  isSSO = false;
  isLoading: boolean = true;

  currentUser: any;
  async ngOnInit() {
    try {
      this.allUserInformation = (await this.dataService.find('/users', this.userInfo.id).toPromise()).body;
      [this.userOrganization, this.companiesSI, this.categoryOfUserSI, this.departmentsSI, this.jobTitlesSI] = (
        await Promise.all([
          this.dataService.find('/organization', this.allUserInformation.organization).toPromise(),
          this.dataService.list('/company-profile', { organization: this.allUserInformation.organization }).toPromise(),
          this.dataService.list('/category-organization').toPromise(),
          this.dataService.list('/misc/department').toPromise(),
          this.dataService.list('/misc/job-title').toPromise()
        ])
      ).map(res => res.body);

      const data = await Promise.all([this.dataService.list('/misc/country').toPromise()]);
      [this.countriesSI] = data.map(d => new MatTableDataSource(d.body));

      this.prepareDataToEdit();
    } catch (error) {}

    this.isLoading = false;
  }

  prepareDataToEdit() {
    const {
      firstName,
      familyName,
      email,
      country,
      department,
      company,
      jobTitle,
      categoriesOrganization
    } = this.allUserInformation;

    this.userProfile.controls.organizationName.setValue(this.userOrganization.name);

    if (email.split('@')[1].includes('mdlz.com')) {
      this.isSSO = true;
      this.userProfile.controls.firstName.disable();
      this.userProfile.controls.familyName.disable();
      this.userProfile.controls.country.disable();
      this.userProfile.controls.department.disable();
      this.userProfile.controls.jobTitle.disable();
    }
    this.userProfile.controls.country.setValue(country);
    this.userProfile.controls.firstName.setValue(firstName);
    this.userProfile.controls.familyName.setValue(familyName);
    this.userProfile.controls.email.setValue(email);
    this.userProfile.controls.department.setValue(department);
    this.userProfile.controls.jobTitle.setValue(jobTitle);
    this.userProfile.controls.company.setValue(company);
    this.userProfile.controls.categoriesOrganization.setValue(categoriesOrganization);
  }

  prepareDataToSubmit() {
    const entity = this.allUserInformation;
    entity.firstName = this.form.firstName.value;
    entity.familyName = this.form.familyName.value;
    entity.country = this.form.country.value;
    entity.department = this.form.department.value;
    entity.jobTitle = this.form.jobTitle.value;
    entity.company = this.form.company.value;
    entity.categoriesOrganization = this.form.categoriesOrganization.value;

    return entity;
  }

  async changePasswordModal() {
    const modal = await this.modalController.create({
      component: ChangePasswordModalComponent,
      componentProps: {
        user: this.userInfo
      },
      cssClass: 'change-password-modal'
    });
    modal.present();
  }

  private createForm() {
    this.userProfile = this.formBuilder.group({
      firstName: ['', Validators.required],
      familyName: ['', Validators.required],
      email: ['', Validators.required],
      country: ['', Validators.required],
      department: ['', Validators.required],
      company: ['', Validators.required],
      jobTitle: ['', Validators.required],
      organizationName: ['', Validators.required],
      categoriesOrganization: ['', Validators.required]
    });
    this.userProfile.controls.organizationName.disable();
    this.userProfile.controls.email.disable();
    this.userProfile.valueChanges.subscribe(() => {
      if (this.userProfile.dirty) this.userChanges.emit(true);
    });
  }

  applyFilter(filterValue: string, values: MatTableDataSource<any[]>) {
    if (filterValue === null) {
      values.filter = '';
    } else {
      values.filter = filterValue.trim().toLowerCase();
    }
  }

  includes(object: any, array: any[]) {
    return array.some(el => el._id === object._id);
  }

  get form() {
    return this.userProfile.controls;
  }
}
