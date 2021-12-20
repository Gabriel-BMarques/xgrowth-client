import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ContactModalComponent } from '@app/shared/modals/contact-modal/contact-modal.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NewPasswordComponent implements OnInit, OnDestroy {
  passwordForm!: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public translate: TranslateService,
    private modalController: ModalController
  ) {
    this.createForm();
  }

  async ngOnInit() {}

  ngOnDestroy() {}

  private createForm() {
    this.passwordForm = this.formBuilder.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      remember: true
    });
  }

  async openContactModal(modalTitle: string, receiverEmail: string): Promise<void> {
    (
      await this.modalController.create({
        cssClass: 'contact-modal',
        component: ContactModalComponent,
        componentProps: {
          modalTitle,
          receiverEmail
        }
      })
    ).present();
  }

  modalUpdate() {}

  changeLanguage(event: any) {}

  nextStep() {}

  login() {}

  createPassword() {}
}
