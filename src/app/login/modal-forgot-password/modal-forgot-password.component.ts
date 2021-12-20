import { Component, OnInit, OnDestroy } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthServerProvider } from '@app/core/provider/auth.provider';

@Component({
  selector: 'app-modal-forgot-password',
  templateUrl: './modal-forgot-password.component.html',
  styleUrls: ['./modal-forgot-password.component.scss']
})
export class ModalForgotPasswordComponent implements OnInit, OnDestroy {
  passwordForm!: FormGroup;
  formSent = false;

  constructor(
    public popover: PopoverController,
    private navParams: NavParams,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private authenticationService: AuthServerProvider
  ) {
    this.createForm();
  }

  ngOnInit() {}

  ngOnDestroy() {}

  ok() {
    this.popover.dismiss();
    this.passwordForm.reset();
  }

  submit() {
    this.authenticationService.resetPassword(this.form.email.value).subscribe(
      res => {
        this.formSent = true;
      },
      err => {
        this.formSent = true;
      }
    );
  }

  private createForm() {
    this.passwordForm = this.formBuilder.group({
      email: ['', Validators.required]
    });
  }

  get form() {
    return this.passwordForm.controls;
  }
}
