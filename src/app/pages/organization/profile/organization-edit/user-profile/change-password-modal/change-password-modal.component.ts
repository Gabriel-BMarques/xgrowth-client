import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '@app/services/data.service';
import { MustMatch } from '@app/validators/must-match.validator';
import { PasswordStrength } from '@app/validators/password-strength.validator';
import { AlertController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss']
})
export class ChangePasswordModalComponent implements OnInit {
  @Input() user: any;
  changePasswordForm: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    private dataService: DataService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  get form(): any {
    return this.changePasswordForm.controls;
  }

  createForm() {
    this.changePasswordForm = this.formBuilder.group(
      {
        oldPassword: ['', Validators.required],
        newPassword: ['', Validators.required],
        confirmNewPassword: ['', Validators.required]
      },
      {
        validators: [PasswordStrength('newPassword'), MustMatch('newPassword', 'confirmNewPassword')]
      }
    );
  }

  createAlert(message: string) {
    this.alertController
      .create({
        message: `${message}`,
        buttons: [
          {
            text: 'OK',
            handler: () => {
              this.alertController.dismiss();
            }
          }
        ]
      })
      .then(alert => alert.present());
  }

  cancel() {
    this.modalController.dismiss();
  }

  markFormGroupTouched(formGroup: FormGroup) {
    (Object as any).values(formGroup.controls).forEach((control: FormGroup) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  submit() {
    this.markFormGroupTouched(this.changePasswordForm);
    this.user.oldPassword = this.form.oldPassword.value;
    this.user.password = this.form.newPassword.value;
    if (this.form.newPassword.errors?.strength) {
      const errorMessage = `Password must be at least 8 characters,
      and must include at least one upper case letter, one lower case letter,
      and one numeric digit`;
      this.createAlert(errorMessage);
      return;
    }
    if (this.changePasswordForm.invalid) return;
    this.dataService
      .update('/users', this.user)
      .toPromise()
      .then(() => this.modalController.dismiss())
      .catch(error => {
        this.createAlert(error.error);
      });
  }
}
