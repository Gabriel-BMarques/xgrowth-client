import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingController, Platform } from '@ionic/angular';
import { I18nService, AuthenticationService } from '@app/core';
import { DataService } from '@app/services/data.service';
import { IUser } from '@app/shared/models/user.model';
@Component({
  selector: 'app-reactivate',
  templateUrl: './reactivate.component.html',
  styleUrls: ['./reactivate.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReactivateComponent implements OnInit, OnDestroy {
  // Main vars
  passwordForm!: FormGroup;
  user: IUser;
  isReactivation: boolean | false;
  reactivationKey: string | undefined;
  // State vars
  isLoading = true;
  completed = false;
  // Box vars
  passwordPlaceHolder: string = '••••••••••';
  title: string = 'CHANGE PASSWORD';
  description: string = 'Create your new password';
  passIsVisible: boolean = false;
  // footer vars
  pdfTerms: any = '../../assets/Terms and Conditions.pdf';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private platform: Platform,
    private loadingController: LoadingController,
    private i18nService: I18nService,
    private authenticationService: AuthenticationService,
    private dataService: DataService
  ) {
    this.createForm();
  }

  async ngOnInit() {
    let reactivationKey;
    await this.route.queryParams.subscribe(res => {
      reactivationKey = res.reactivationKey;
    });

    this.reactivationKey = reactivationKey;
    this.isReactivation = !!this.reactivationKey;

    if (this.isReactivation) {
      let userData;
      const _authService = this.authenticationService;
      const _reactivationKey = this.reactivationKey;
      const _this = this;

      // tslint:disable-next-line: only-arrow-functions
      userData = await new Promise(function(resolve: any, reject: any) {
        _authService
          .reactivate(_reactivationKey)
          .toPromise()
          .then(
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
        this.isLoading = false;
      } else {
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    } else {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  ngOnDestroy() {}

  async ionViewWillEnter() {}

  setPassword() {
    let entity: any;
    entity = this.user;
    entity.password = this.form.password.value;
    entity.reactivated = true;
    this.dataService
      .updateUser('/users', entity)
      .toPromise()
      .then(res => {
        this.completed = true;
        this.backToLogin();
      });
  }

  backToLogin() {
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  checkPassPlaceHolder() {
    if (this.passwordForm.controls.password.invalid && this.passwordForm.controls.password.touched) {
      this.passwordPlaceHolder = null;
      return;
    } else {
      this.passwordPlaceHolder = '••••••••••';
      return;
    }
  }

  goToLogin() {
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  openTerms() {
    window.open(this.pdfTerms, '_blank');
  }

  needHelp() {
    window.location.href = 'mailto:support@growinco.com';
  }

  get form() {
    return this.passwordForm.controls;
  }

  private createForm() {
    this.passwordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }
}
