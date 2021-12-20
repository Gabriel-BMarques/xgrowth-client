import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService, CredentialsService, I18nService, Logger, untilDestroyed } from '@app/core';
import { DataWizardService } from '@app/services/data-wizard.service';
import { UserInfoService } from '@app/services/user-info.service';
import { ContactModalComponent } from '@app/shared/modals/contact-modal/contact-modal.component';
import { IUser } from '@app/shared/models/user.model';
import { environment } from '@env/environment';
import { LoadingController, ModalController, Platform, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, from, Subscription } from 'rxjs';
import { finalize, map, take } from 'rxjs/operators';
import { LanguageSwitchComponent } from './language-switch/language-switch.component';
import { ModalForgotPasswordComponent } from './modal-forgot-password/modal-forgot-password.component';
import { ModalUpdateComponent } from './modal-update/modal-update.component';

const log = new Logger('Login');

/* declare let pendo: any; */

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {
  version: string | null = environment.version;
  error: string | undefined;
  register: string;
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isLoading = false;
  currentModal: any;
  selectedTab: string;
  isActivation: boolean | false;
  activationKey: string | undefined;
  activationSuccess: boolean | false;
  user: IUser;
  language = 'en-US';
  errorMessage: string;

  loginBtnText = 'NEXT';
  showPasswordField = false;
  passIsVisible: boolean = false;

  credentials: any;
  ssoLogin: boolean = false;
  ssoLoading: boolean = false;
  userDomain: string;
  userEmail: string;
  foundUser: any;

  redirectUrlSubscription: Subscription;
  redirectUrl: any;

  // install pwa vars
  deferredPrompt: any;
  showPWABtn = false;
  isBlocked = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private platform: Platform,
    private loadingController: LoadingController,
    private i18nService: I18nService,
    private authenticationService: AuthenticationService,
    private credentialsService: CredentialsService,
    private popoverController: PopoverController,
    private wizardService: DataWizardService,
    public dialog: MatDialog,
    public translate: TranslateService,
    private userInfoService: UserInfoService,
    private modalController: ModalController
  ) {
    this.createForm();
  }

  async ngOnInit() {
    window.addEventListener('beforeinstallprompt', e => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;
      // Update UI notify the user they can install the PWA
      this.showInstallPromotion();
    });

    this.credentials = {};
    this.redirectUrlSubscription = this.route.queryParams.pipe(take(1)).subscribe(params => {
      this.credentials.token = params.token;
      this.credentials.email = params.email;
      this.redirectUrl = params.redirect;
      this.activationKey = params.activationKey;
    });

    if (this.credentials.token) {
      this.ssoLoading = true;
      this.credentialsService.setCredentials(this.credentials);
      try {
        await this.userInfoService.setUserInfo();
      } catch {
        this.ssoLoading = false;
      }
      if (this.credentialsService.isAuthenticated()) {
        this.ssoLogin = true;
        this.router.navigate(['/'], { replaceUrl: true }).then(() => {
          window.location.reload();
        });
      }
      this.ssoLoading = false;
    }

    this.loginForm.controls.username.valueChanges.subscribe(user => {
      this.showPasswordField = false;
      this.loginForm.get('password').reset();
      if (user.includes('@')) {
        this.userEmail = user;
        this.userDomain = user.substring(user.lastIndexOf('@') + 1);
        if (
          (this.userDomain.toLowerCase() === 'growinco.com' || this.userDomain.toLowerCase() === 'mdlz.com') &&
          environment.production
        ) {
          this.loginBtnText = 'LOGIN WITH MICROSOFT';
        } else {
          this.loginBtnText = 'NEXT';
        }
      }
    });

    if (this.credentialsService.credentials && !this.ssoLogin) {
      this.authenticationService.logout().subscribe(() => {});
    }

    this.translate.use('en-US');
    localStorage.setItem('language', 'en-US');

    if (localStorage.getItem('language') === 'en-US') {
      this.register = 'Register';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.register = 'Cadastro';
    }

    this.wizardService.reset();

    this.isActivation = !!this.activationKey;

    if (this.isActivation) {
      let userData;
      const _authService = this.authenticationService;
      const _activationKey = this.activationKey;
      const _this = this;

      // tslint:disable-next-line: only-arrow-functions
      userData = await new Promise(function(resolve: any, reject: any) {
        _authService.activate(_activationKey).subscribe(
          (res: any) => {
            if (res.body.user) {
              resolve(res.body.user);
            } else {
              reject();
            }
          },
          error => {
            _this.router.navigate(['/login'], { replaceUrl: true });
          }
        );
      });
      if (userData) {
        this.user = userData;
        this.openDialog();
        this.isLoading = false;
      } else {
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    }
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

  // install pwa methods begin

  showInstallPromotion() {
    this.showPWABtn = true;
  }

  hideInstallPromotion() {
    this.showPWABtn = true;
  }

  installPwa() {
    // Hide the app provided install promotion
    this.hideInstallPromotion();
    // Show the install prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice.then(() => {});
  }

  // install pwa methods end

  async nextStep() {
    if (this.loginBtnText === 'NEXT') {
      this.loginBtnText = 'LOGIN';
      this.showPasswordField = true;
    } else if (this.loginBtnText === 'LOGIN') {
      this.login();
    } else if (this.loginBtnText === 'LOGIN WITH MICROSOFT') {
      window.location.href = `${environment.websiteUrl}/api/saml/auth?domain=${this.userDomain}&userFrom=xgrowth`;
    }
  }

  ngOnDestroy() {
    this.redirectUrlSubscription.unsubscribe();
  }

  async ionViewWillEnter() {}

  handleStatus(resp: any) {
    let errorMessage;
    switch (resp.status) {
      case 407:
        errorMessage = `${resp.message} to your email`;
        this.error = errorMessage;
        break;
      case 408:
        errorMessage = resp.message;
        this.error = errorMessage;
        this.modalUpdate();
        break;
      case 409:
        errorMessage = resp.message;
        this.error = errorMessage;
        break;
    }
  }

  async login() {
    this.isLoading = true;
    this.error = '';
    const login$ = this.authenticationService.login(this.loginForm.value);
    console.log(this.loginForm.value, 'login form value');

    const loadingOverlay = await this.loadingController.create({});
    const loading$ = from(loadingOverlay.present());
    forkJoin([login$, loading$])
      .pipe(
        map(([response, ...rest]) => response),
        finalize(() => {
          this.loginForm.markAsPristine();
          this.isLoading = false;
          loadingOverlay.dismiss();
        }),
        untilDestroyed(this)
      )
      .toPromise()
      .then(
        (response: any) => {
          if (response.status) {
            this.handleStatus(response);
          } else {
            /* if (environment.production) this.initializePendo(response); */
            if (this.redirectUrl) {
              this.router.navigate([this.redirectUrl], { replaceUrl: true }).then(() => {
                window.location.reload();
              });
            } else {
              if (response.interestsStepCompleted === false) {
                this.router.navigate(['/interests'], { replaceUrl: true }).then(() => {
                  window.location.reload();
                });
              } else {
                this.router.navigate(['/'], { replaceUrl: true }).then(() => {
                  window.location.reload();
                });
              }
            }
          }
        },
        error => {
          log.debug(`Login error: ${error}`);
          this.error = 'Incorrect username or password';
        }
      );
  }

  openDialog(): void {
    this.isLoading = true;
    const dialogRef = this.dialog.open(DialogActivationSuccessComponent, {
      width: '80vw',
      data: { email: this.user.email }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.router.navigate([''], { replaceUrl: true });
    });
  }

  switchTab(event: any) {
    this.selectedTab = event.tab.textLabel;
  }

  setLanguage(language: string) {
    this.i18nService.language = language;
  }

  next() {
    this.wizardService.step1Form = this.registerForm;
    this.wizardService.next();
    this.router.navigate(['/register'], { replaceUrl: true });
  }

  goToRegister() {
    this.router.navigate(['/register'], { replaceUrl: true });
  }
  async modalUpdate() {
    const modal = await this.popoverController.create({
      component: ModalUpdateComponent,
      cssClass: 'modal-update'
    });
    modal.present();
  }

  async modalForgotPassword() {
    const modal = await this.popoverController.create({
      component: ModalForgotPasswordComponent,
      cssClass: 'modal-forgot-password'
    });
    modal.present();
  }

  get currentLanguage(): string {
    return this.i18nService.language;
  }

  get languages(): string[] {
    return this.i18nService.supportedLanguages;
  }

  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }

  async changeLanguage(ev: any) {
    const popover = await this.popoverController.create({
      component: LanguageSwitchComponent,
      event: ev,
      translucent: true,
      cssClass: 'language-switch'
    });
    return popover.present();
  }

  private createForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: [''],
      remember: true
    });
    this.registerForm = this.formBuilder.group({
      selectedPlan: ['']
    });
  }
}

@Component({
  selector: 'dialog-activation-success',
  templateUrl: './dialog-activation.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogActivationSuccessComponent implements OnInit {
  email: string;

  constructor(
    public dialogRef: MatDialogRef<DialogActivationSuccessComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any
  ) {}

  ngOnInit() {
    this.email = this.data.email;
  }

  confirm() {
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
