import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '@app/services/data.service';
import { MailService } from '@app/services/mail.service';
import { ModalController, PopoverController } from '@ionic/angular';
import * as _ from 'lodash';
import { ReferSolverPopoverComponent } from './refer-solver-popover/refer-solver-popover.component';
import { TranslateService } from '@ngx-translate/core';
import { NavigationService } from '@app/services/navigation.service';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';
import { find } from 'lodash';

@Component({
  selector: 'app-modal-refer-solver',
  templateUrl: './modal-refer-solver.component.html',
  styleUrls: ['./modal-refer-solver.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModalReferSolverComponent implements OnInit {
  // Receiving information
  @Input() name: string;
  @Input() description: string;
  @Input() solverIndication: any;
  @Input() brief: any;

  referSolverForm!: FormGroup;
  isLoading = true;
  phonePrefixes: any;
  disableButton: boolean = true;
  auxContactInfoArray: any[] = [];
  briefName: any;
  briefOwner: any;
  briefCompany: any;

  contactOptions = [{ contactBy: 'E - mail' }, { contactBy: 'Phone Number' }, { contactBy: 'Website' }];
  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private mailService: MailService,
    private popoverController: PopoverController,
    private navigationService: NavigationService,
    private briefWizardService: BriefAddWizardService
  ) {
    this.createForms();
  }

  async ngOnInit() {
    this.isLoading = false;
    await this.dataService
      .list('/misc/phone-prefix')
      .toPromise()
      .then(countries => {
        this.phonePrefixes = countries.body;
      });
  }

  async ionViewDidEnter() {
    if (this.brief) {
      (this.briefName = this.brief.Title),
        (this.briefOwner = `${this.brief.CreatedBy.firstName} ${this.brief.CreatedBy.familyName}`);
      this.briefCompany = `${this.brief.ClientId.companyName}`;
    }
  }

  async getBriefOwner() {
    let owner;
    await this.dataService
      .find('/users', this.brief.CreatedBy)
      .toPromise()
      .then(res => {
        owner = res.body;
      });
    return owner;
  }

  async getBriefCompany() {
    let company;
    await this.dataService
      .find('/company', this.brief.ClientId)
      .toPromise()
      .then(res => {
        company = res.body;
      });
    return company;
  }

  isValid() {
    return !(this.referSolverForm.touched || this.referSolverForm.invalid);
  }

  markFormGroupTouched(formGroup: FormGroup) {
    (Object as any).values(formGroup.controls).forEach((control: FormGroup) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  disableButtonSubmit() {
    if (
      (this.form.name.invalid && !this.auxContactInfoArray.length) ||
      (this.form.name && this.form.email.invalid) ||
      (this.form.name && this.form.url.invalid)
    ) {
      return true;
    }
    return false;
  }

  submit() {
    this.markFormGroupTouched(this.referSolverForm);
    this.prepareDataToSubmit();
  }

  getContactData() {
    const name = this.form.name.value;
    let email = this.form.email ? this.form.email.value : null;
    let website = this.form.url ? this.form.url.value : null;
    let phone = this.form.contactData ? this.form.contactData.value : null;
    email ? '' : (email = null);
    website ? '' : (website = null);
    phone ? '' : (phone = null);
    let phonePrefix = this.form.phonePrefix ? this.form.phonePrefix.value : null;
    let fullNumber;
    if (phone && phonePrefix) {
      phonePrefix = phonePrefix.split(' ')[1];
      fullNumber = `${phonePrefix} ${phone}`;
    } else if (phone) {
      phonePrefix = null;
      fullNumber = `${phone}`;
    } else {
      fullNumber = null;
    }
    const objectContactInfo = {
      name: name,
      email: email,
      website: website,
      phone: fullNumber,
      briefName: this.briefName,
      briefOwner: this.briefOwner,
      briefCompany: this.briefCompany
    };
    return objectContactInfo;
  }

  addSolver(option?: string) {
    const contactInfo = this.getContactData();
    const { name } = contactInfo;
    if (name.length > 0) {
      this.auxContactInfoArray.push(contactInfo);
      if (option === 'reset') {
        this.resetForm();
      }
    }
  }

  resetForm() {
    this.form.name.reset();
    this.form.email.reset();
    this.form.url.reset();
    this.form.contactData.reset();
    this.form.phonePrefix.reset();
  }

  // changeContactOption(event: any) {
  //   if (event.value === 'Phone Number') {
  //     this.form.email.reset();
  //     this.form.url.reset();
  //     this.form.email.clearValidators();
  //     this.form.email.updateValueAndValidity();
  //     this.form.url.clearValidators();
  //     this.form.url.updateValueAndValidity();
  //     this.form.phonePrefix.setValidators(Validators.required);
  //     this.form.contactData.setValidators(Validators.required);
  //   } else if (event.value === 'E - mail') {
  //     this.form.contactData.reset();
  //     this.form.phonePrefix.reset();
  //     this.form.url.reset();
  //     this.form.url.clearValidators();
  //     this.form.url.updateValueAndValidity();
  //     this.form.phonePrefix.clearValidators();
  //     this.form.phonePrefix.updateValueAndValidity();
  //     this.form.contactData.clearValidators();
  //     this.form.contactData.updateValueAndValidity();
  //     this.form.email.setValidators([Validators.required, Validators.email]);
  //   } else if (event.value === 'Website') {
  //     this.form.email.reset();
  //     this.form.phonePrefix.reset();
  //     this.form.contactData.reset();
  //     this.form.email.clearValidators();
  //     this.form.email.updateValueAndValidity();
  //     this.form.phonePrefix.clearValidators();
  //     this.form.phonePrefix.updateValueAndValidity();
  //     this.form.contactData.clearValidators();
  //     this.form.contactData.updateValueAndValidity();
  //     this.form.url.setValidators(Validators.required);
  //   }
  // }

  hasEmptyContact(contactData: any) {
    if (!contactData.email && !contactData.website && !contactData.phone) {
      return true;
    }
    return false;
  }

  async prepareDataToSubmit() {
    const contactData = this.getContactData();
    if (this.form.name.value && this.hasEmptyContact(contactData)) {
      this.contactConfirm(this.auxContactInfoArray);
    } else {
      const popover = await this.popoverController.create({
        component: ReferSolverPopoverComponent,
        cssClass: 'refer-contact-confirm',
        componentProps: {
          complete: true
        }
      });
      popover.present();
      if (!this.form.name.invalid) {
        this.addSolver();
      }
      this.auxContactInfoArray.map(async solverContact => {
        let referData: any = {
          companyName: solverContact.name,
          contactData: {
            briefName: solverContact.briefName,
            briefOwner: solverContact.briefOwner,
            briefCompany: solverContact.briefCompany,
            contactEmail: solverContact.email,
            contactPhone: solverContact.phone,
            website: solverContact.website
          }
        };
        referData.contactData = _.omitBy(referData.contactData, _.isNil);
        referData.briefName = _.omitBy(referData.briefName, _.isNil);
        await this.mailService
          .sendMessage('refer-solver', referData)
          .toPromise()
          .then(() => {});
      });
      this.modalController.dismiss();
    }
  }

  async contactConfirm(solvers: any[]) {
    const popover = await this.popoverController.create({
      component: ReferSolverPopoverComponent,
      cssClass: 'refer-contact-confirm',
      componentProps: {
        complete: false
      }
    });
    popover.present();
    popover.onDidDismiss().then(response => {
      if (response.data === 0) {
        if (!this.form.name.invalid) {
          this.addSolver();
        }
        solvers.map(async solverContact => {
          let referData: any = {
            companyName: solverContact.name,
            contactData: {
              briefName: solverContact.briefName,
              contactEmail: solverContact.email,
              contactPhone: solverContact.phone,
              website: solverContact.website
            }
          };
          referData.contactData = _.omitBy(referData.contactData, _.isNil);
          await this.mailService
            .sendMessage('refer-solver', referData)
            .toPromise()
            .then(() => {});
        });
        this.modalController.dismiss();
      }
    });
  }

  private createForms() {
    // Regex for websites url
    const webRegex = '(^http[s]?:/{2})|(^www)|(^/{1,2})';
    this.referSolverForm = this.formBuilder.group({
      name: [null, Validators.required],
      // contactOption: ['', Validators.required],
      email: [null, Validators.email],
      phonePrefix: [null],
      contactData: [null], // , Validators.pattern('^0?[0-9]{10}$')]  ou https://www.regextester.com/17
      url: [null, Validators.pattern(webRegex)]
    });
  }

  cancel() {
    this.modalController.dismiss();
  }

  get form() {
    return this.referSolverForm.controls;
  }
}
