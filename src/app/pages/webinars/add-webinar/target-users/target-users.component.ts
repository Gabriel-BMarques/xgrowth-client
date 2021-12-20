import { ModalSubmit } from './../modal-submit/modal-submit.component';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { IWebinar } from '@app/shared/models/webinar.model';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { TutorialDetailsComponent } from '@app/pages/tutorial/tutorial-details/tutorial-details.component';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-target-users',
  templateUrl: './target-users.component.html',
  styleUrls: ['./target-users.component.scss']
})
export class TargetUsersComponent implements OnInit, OnDestroy {
  //state management
  isLoading = true;
  isEditing: boolean;
  allCompaniesSelected: boolean = false;
  allDepartmentsSelected: boolean = false;
  currentModal: any;
  formSubscription: Subscription;
  isSaving: boolean = false;

  //new vars
  webinar: IWebinar;
  targetUsersForm: FormGroup;
  invitedUsers: any[] = [];
  userQuery: any = {};
  tutorial: any;

  //select options
  organizations: any[];
  departments: any[];
  companies: any[];
  departmentsCopy: any[];
  companiesCopy: any[];
  selectedCompanyIds: string[] = [];
  selectedDespartmentIds: string[] = [];

  constructor(
    public modalController: ModalController,
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {
    this.createForm();
  }

  createForm() {
    this.targetUsersForm = this.formBuilder.group({
      companies: [[], Validators.required],
      departments: [[]]
    });
  }

  async ngOnInit() {
    [this.companies, this.departments] = (
      await Promise.all([
        this.dataService.getUserRelatedCompanies().toPromise(),
        this.dataService.list('/misc/department').toPromise()
      ])
    ).map(res => res.body);

    this.companiesCopy = this.companies;
    this.departmentsCopy = this.departments;

    this.getOrganizationsByCompanies();

    if (this.route.snapshot.params.id && this.route.snapshot.params.id.length) {
      this.webinar = (await this.dataService.find('/webinar', this.route.snapshot.params.id).toPromise()).body;
      this.prepareDataToEdit();
    }
    this.prepareSelectionCompanies();
    this.prepareSelectionDepartments();
    this.queryUsers();
    this.formSubscription = this.targetUsersForm.valueChanges.subscribe(async () => {
      this.isSaving = true;
      this.queryUsers();
      await this.saveTargetUsers();
      this.isSaving = false;
    });
    this.isLoading = false;
  }

  async openTutorial() {
    if (!this.tutorial) {
      this.tutorial = (
        await this.dataService.list('/tutorial', { topic: 'webinar', type: 'main topic', visible: true }).toPromise()
      ).body[0];
    }
    const modal = this.modalController.create({
      component: TutorialDetailsComponent,
      cssClass: 'tutorial-modal-class',
      componentProps: {
        tutorialInput: this.tutorial
      }
    });
    (await modal).present();
    this.currentModal = modal;
    (await modal).onDidDismiss();
  }

  getOrganizationsByCompanies() {
    this.organizations = _.uniqWith(
      this.companies.map(company => company.organization),
      _.isEqual
    );
  }

  searchCompanies(searchTerm?: string) {
    if (!searchTerm || !searchTerm.length) {
      this.companies = this.companiesCopy;
    } else {
      const term = searchTerm.trim().toLowerCase();
      this.companies = this.companiesCopy.filter(company => {
        return (
          company.companyName
            .trim()
            .toLowerCase()
            .includes(term) ||
          company.organization.name
            .trim()
            .toLowerCase()
            .includes(term)
        );
      });
    }
    this.getOrganizationsByCompanies();
  }

  searchDepartment(searchTerm?: string) {
    if (!searchTerm || !searchTerm.length) {
      this.departments = this.departmentsCopy;
    } else {
      const term = searchTerm.trim().toLowerCase();
      this.departments = this.departmentsCopy.filter(dep => {
        return dep.name
          .trim()
          .toLowerCase()
          .includes(term);
      });
    }
  }

  // companies below

  prepareSelectionCompanies() {
    this.selectedCompanyIds = this.targetUsersForm.controls.companies.value;
    this.companies.forEach((comp: any) => {
      if (this.selectedCompanyIds.includes(comp._id)) comp.selected = true;
      else comp.selected = false;
    });
    const found = this.companies.some(c => !c.selected);
    this.allCompaniesSelected = !found;
  }

  selectCompany(entity: any) {
    if (entity.selected) {
      this.selectedCompanyIds.push(entity._id);
    } else {
      if (this.selectedCompanyIds[this.selectedCompanyIds.indexOf(entity._id)] === entity._id) {
        this.selectedCompanyIds.splice(this.selectedCompanyIds.indexOf(entity._id), 1);
      }
    }
    this.selectedCompanyIds = _.uniqWith(this.selectedCompanyIds, _.isEqual);
    this.targetUsersForm.controls.companies.setValue(this.selectedCompanyIds);
  }

  deselectCompanies() {
    this.companies.forEach(entity => (entity.selected = false));
    this.selectedCompanyIds = [];
    this.targetUsersForm.controls.companies.setValue([this.selectedCompanyIds]);
  }

  toggleAllCompanies() {
    let allCompaniesIDs = this.companies.map(entity => entity._id);
    if (!this.allCompaniesSelected) {
      this.deselectCompanies();
    } else {
      this.companies.forEach(entity => (entity.selected = true));
      this.selectedCompanyIds = allCompaniesIDs;
    }
    this.targetUsersForm.controls.companies.setValue(this.selectedCompanyIds);
  }

  // departments below
  prepareSelectionDepartments() {
    this.selectedDespartmentIds = this.targetUsersForm.controls.departments.value;
    this.departments.forEach((dep: any) => {
      if (this.selectedDespartmentIds.includes(dep.name)) dep.selected = true;
      else dep.selected = false;
    });
    const found = this.departments.some(c => !c.selected);
    this.allDepartmentsSelected = !found;
  }

  selectDepartment(entity: any) {
    if (entity.selected) {
      this.selectedDespartmentIds.push(entity.name);
    } else {
      if (this.selectedDespartmentIds[this.selectedDespartmentIds.indexOf(entity.name)] === entity.name) {
        this.selectedDespartmentIds.splice(this.selectedDespartmentIds.indexOf(entity.name), 1);
      }
    }
    this.selectedDespartmentIds = _.uniqWith(this.selectedDespartmentIds, _.isEqual);
    this.targetUsersForm.controls.departments.setValue(this.selectedDespartmentIds);
  }

  deselectDepartments() {
    this.departments.forEach(entity => (entity.selected = false));
    this.selectedDespartmentIds = [];
    this.targetUsersForm.controls.departments.setValue([this.selectedDespartmentIds]);
  }

  toggleAllDepartments() {
    let allDepartmentsNames = this.departments.map(entity => entity.name);
    if (!this.allDepartmentsSelected) {
      this.deselectDepartments();
    } else {
      this.departments.forEach(entity => (entity.selected = true));
      this.selectedDespartmentIds = allDepartmentsNames;
    }
    this.targetUsersForm.controls.departments.setValue(this.selectedDespartmentIds);
  }

  ngOnDestroy() {
    // unsubscribe from all observables to avoid memory leaks
    this.formSubscription.unsubscribe();
  }

  async queryUsers() {
    this.userQuery = {
      company: this.targetUsersForm.controls.companies.value.length
        ? this.targetUsersForm.controls.companies.value
        : undefined,
      department: this.targetUsersForm.controls.departments.value.length
        ? this.targetUsersForm.controls.departments.value
        : undefined
    };
    Object.keys(this.userQuery).forEach(key => (this.userQuery[key] === undefined ? delete this.userQuery[key] : {}));
  }

  get canSubmit(): boolean {
    return !!Object.keys(this.userQuery).length && this.targetUsersForm.valid;
  }

  async saveTargetUsers() {
    if (!this.canSubmit) return;
    this.prepareDataToSubmit();
    try {
      this.webinar = (await this.dataService.update('/webinar', this.webinar).toPromise()).body;
    } catch (err) {
      console.log(err);
    }
  }

  async submitModal() {
    if (!this.canSubmit) return;
    this.prepareDataToSubmit();
    const modal = this.modalController.create({
      component: ModalSubmit,
      cssClass: 'modal-submit-class',
      componentProps: {
        webinar: this.webinar
      }
    });
    (await modal).present();
    (await modal).onDidDismiss();
  }

  prepareDataToSubmit() {
    this.webinar.targetCompanies = this.targetUsersForm.controls.companies.value;
    this.webinar.targetDepartments = this.targetUsersForm.controls.departments.value;
  }

  prepareDataToEdit() {
    this.targetUsersForm.controls.companies.setValue(this.webinar.targetCompanies);
    this.targetUsersForm.controls.departments.setValue(this.webinar.targetDepartments);
  }

  async previousStep() {
    if (!!this.webinar) {
      this.router.navigate(['/webinars/core-info/edit', this.webinar._id], { replaceUrl: true });
    } else {
      this.router.navigate(['/webinars/core-info/'], { replaceUrl: true });
    }
  }
}
