import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CredentialsService } from '@app/core';
import { MailService } from '@app/services/mail.service';
import { UserInfoService } from '@app/services/user-info.service';
import { IUser } from '@app/shared/models/user.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-contact-modal',
  templateUrl: './contact-modal.component.html',
  styleUrls: ['./contact-modal.component.scss']
})
export class ContactModalComponent implements OnInit {
  @Input() modalTitle: string;
  @Input() receiverEmail: string;

  contactForm: FormGroup;

  get form() {
    return this.contactForm.controls;
  }

  get formInvalid(): boolean {
    return this.contactForm.invalid;
  }

  get isLoggedIn(): boolean {
    return !!this.credentialsService.credentials;
  }

  private get user(): IUser {
    return this.userInfoService.storedUserInfo;
  }

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private mailService: MailService,
    private credentialsService: CredentialsService,
    private userInfoService: UserInfoService
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  inputEmpty(formControl: AbstractControl): boolean {
    return (
      formControl.value === undefined ||
      formControl.value === null ||
      formControl.value === '' ||
      !formControl.value.length
    );
  }

  async sendContactEmail(): Promise<void> {
    let [name, email, subject, message] = Object.keys(this.form).map(key => this.form[key].value);
    let mailData = {
      name,
      email,
      subject,
      message,
      receiver: this.receiverEmail
    };
    await this.mailService.sendMessage('contact', mailData).toPromise();
    this.dismiss();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  private fillInput(value: string, formControl: AbstractControl): void {
    formControl.setValue(value);
    formControl.disable();
  }

  private createForm(): void {
    this.contactForm = this.formBuilder.group({
      name: [null, Validators.required],
      email: [null, Validators.required],
      subject: [null, Validators.required],
      message: [null, Validators.required]
    });

    if (this.isLoggedIn) {
      let name = `${this.user.firstName} ${this.user.familyName}`;
      let email = this.user.email;
      this.fillInput(name, this.form.name);
      this.fillInput(email, this.form.email);
    }
  }
}
