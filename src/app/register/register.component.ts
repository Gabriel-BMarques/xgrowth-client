import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { DataService } from '@app/services/data.service';
import { ModalForgotPasswordComponent } from '../login/modal-forgot-password/modal-forgot-password.component';
import { AuthenticationService } from '@app/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit {
  // main vars
  email: string;
  password: string;
  domain: string;
  userExists: Boolean = false;
  domainExists: Boolean = false;
  isSSO: Boolean;
  dataForm: any;

  // form vars
  registerForm!: FormGroup;
  emailPlaceHolder: string = 'example@email.com';
  passwordPlaceHolder: string = '••••••••••';
  passIsVisible: boolean = false;

  // registration step vars
  registrationStep: string = 'userEmail';
  emailStep: Boolean = true;
  passwordStep: Boolean = false;
  activationStep: Boolean = false;

  title: string = 'Sign up';
  description: string = "First, what's your corporate email?";
  registrationButton: string = 'Next';

  // footer vars
  pdfTerms: any = '../../assets/Terms and Conditions.pdf';

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private popoverController: PopoverController,
    private authenticationService: AuthenticationService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.registerForm.controls.email.valueChanges.subscribe(user => {
      if (user.includes('@')) {
        this.email = user;
        this.domain = user.substring(user.lastIndexOf('@') + 1);
        if (this.domain.toLowerCase() === 'growinco.com' || this.domain.toLowerCase() === 'mdlz.com') {
          this.registrationButton = 'Sign up with Microsoft';
        } else {
          this.registrationButton = 'Next';
        }
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  checkPlaceHolder() {
    if (this.registerForm.controls.email.invalid && this.registerForm.controls.email.touched) {
      this.emailPlaceHolder = null;
      return;
    } else {
      this.emailPlaceHolder = 'example@email.com';
      return;
    }
  }

  checkPassPlaceHolder() {
    if (this.registerForm.controls.password.invalid && this.registerForm.controls.password.touched) {
      this.passwordPlaceHolder = null;
      return;
    } else {
      this.passwordPlaceHolder = '••••••••••';
      return;
    }
  }

  next(step: string) {
    switch (step) {
      case 'email':
        this.description = "First, what's your corporate email?";
        this.emailStep = true;
        this.passwordStep = false;
        break;
      case 'password':
        if (!this.registerForm.controls.email.invalid) {
          this.email = this.registerForm.controls.email.value;
          this.verifyUser();
          this.verifyEmailDomain();
        }
        break;
      case 'onSave':
        if (!this.registerForm.controls.password.invalid) {
          this.register();
        }
        break;
      case 'onProceed':
        this.goToCompleteRegistrationStep();
        break;
      default:
        break;
    }
  }

  verifyUser() {
    let userEmail = this.email;

    this.dataService
      .verifyUser('verifyUser', { email: userEmail })
      .toPromise()
      .then((res: any) => {
        this.userExists = res.body.user;
        if (this.userExists) {
          this.description =
            '<p class="text-center"> Hmm... <span class="font-weight-bold">' +
            this.registerForm.controls.email.value +
            '</span> has already been registered.</p>';
          this.emailStep = this.passwordStep = false;
        } else {
          this.domain = this.email.substring(this.email.lastIndexOf('@') + 1);

          // SSO
          if (this.domain.toLowerCase() === 'growinco.com' || this.domain.toLowerCase() === 'mdlz.com') {
            this.isSSO = true;
            return (window.location.href = `${environment.serverSamlUrl}/api/saml/auth?domain=${this.domain}&userFrom=xgrowth`);
          }

          this.description = "Now, it's time to define a password";
          this.passwordStep = true;
          this.emailStep = false;
        }
      });
  }

  verifyEmailDomain() {
    let userEmail = this.email;

    // Allowed domain
    this.authenticationService
      .verifyDomain({ email: userEmail })
      .toPromise()
      .then((res: any) => {
        this.domainExists = res.body.domain;
        console.log('Domain exists', res.body.domain);
      });
  }

  register() {
    this.markFormGroupTouched(this.registerForm);
    this.prepareDataToSubmit();

    this.authenticationService.register(this.dataForm).subscribe(
      res => {
        console.log('true', res);
        this.login();
      },
      err => {
        console.log('false', err);
      }
    );
  }

  async login() {
    this.dataForm = {
      username: this.registerForm.controls.email.value,
      password: this.registerForm.controls.password.value
    };
    this.authenticationService
      .login(this.dataForm)
      .toPromise()
      .then(
        (response: any) => {
          if (!response.status) {
            console.log(response);
          }
          if (this.domainExists)
            this.description =
              "We've sent you an email to confirm your account creation. </br> Please check your inbox to complete your registration.";
          else
            this.description =
              "We've sent you an email to confirm your account creation. </br> You can do it now or later, but it will be necessary for your next login.";

          this.title = 'Activate account';
          this.emailStep = this.passwordStep = false;
          this.activationStep = true;
        },
        error => {
          console.log(error);
        }
      );
  }

  goToCompleteRegistrationStep() {
    this.router.navigate(['/complete-register'], { replaceUrl: true }).then(() => {
      window.location.reload();
    });
  }

  async modalForgotPassword() {
    const modal = await this.popoverController.create({
      component: ModalForgotPasswordComponent,
      cssClass: 'modal-forgot-password'
    });
    modal.present();
  }

  markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control: FormGroup) => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  prepareDataToSubmit() {
    this.dataForm = {
      email: this.registerForm.controls.email.value,
      password: this.registerForm.controls.password.value
    };
  }

  openTerms() {
    window.open(this.pdfTerms, '_blank');
  }

  needHelp() {
    window.location.href = 'mailto:support@growinco.com';
  }

  logout() {
    this.authenticationService
      .logout()
      .toPromise()
      .then(() => this.router.navigate(['/login'], { replaceUrl: true }));
  }

  private createForm() {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }
}
