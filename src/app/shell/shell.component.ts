import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService, CredentialsService, I18nService, Logger, untilDestroyed } from '@app/core';
import { DataService } from '@app/services/data.service';
import { HeaderService } from '@app/services/header.service';
import { LoadBriefsService } from '@app/services/load-brief.service';
import { NavigationService } from '@app/services/navigation.service';
import { environment } from '@env/environment';
import { ActionSheetController, AlertController, LoadingController, Platform, PopoverController } from '@ionic/angular';
import { ActionSheetButton, ActionSheetOptions, TextFieldTypes } from '@ionic/core';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, from } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { BriefTypeModalComponent } from '../pages/briefs/add-brief/brief-type-modal/brief-type-modal.component';

const log = new Logger('Login');
@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ShellComponent implements OnDestroy {
  selectedMenu: string;
  userRole: string;

  hasWebinarAccess: boolean = false;

  // install pwa vars
  deferredPrompt: any;
  showPWABtn = false;
  version = environment.version;
  isLoading: boolean;
  error: any;

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private platform: Platform,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private authenticationService: AuthenticationService,
    private credentialsService: CredentialsService,
    private dataService: DataService,
    private i18nService: I18nService,
    private navigationService: NavigationService,
    private route: ActivatedRoute,
    private popover: PopoverController,
    public headerService: HeaderService,
    private loadBriefsService: LoadBriefsService,
    private loadingController: LoadingController
  ) {}

  ngOnDestroy(): void {}

  async menuOpened() {
    this.userRole = this.credentialsService.checkRole;
    switch (this.userRole) {
      case 'admin':
        this.selectedMenu = 'adminMenu';
        this.hasWebinarAccess = true;
        break;
      default:
        this.selectedMenu = 'mainMenu';
        break;
    }

    window.addEventListener('beforeinstallprompt', e => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;
      // Update UI notify the user they can install the PWA
      this.showInstallPromotion();
    });

    if (this.userRole !== 'admin')
      this.hasWebinarAccess = (await this.dataService.getUserCompany().toPromise()).body.hasWebinarAccess;
  }

  menuClosed() {}

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

  goToProfile() {
    this.dataService.getUserCompany().subscribe(company => {
      this.router.navigate(['/company', company.body._id, 'profile'], { replaceUrl: true });
    });
  }

  selectMenu(menu: string) {
    setTimeout(() => {
      this.selectedMenu = menu;
    }, 500);
  }

  navigationToll(title?: string) {
    const currentRoute = window.location.hash;
    this.navigationService.clearWizardData(currentRoute);
  }

  async addPost() {
    const currentRoute = window.location.hash;
    console.log(currentRoute);
    if (currentRoute.includes('#/post/add')) {
      return;
    } else {
      this.router.navigate(['/post/add'], { replaceUrl: true });
    }
  }

  async addBrief() {
    const currentRoute = window.location.hash;
    if (currentRoute.includes('#/briefs/add-brief')) return;
    const modal = await this.popover.create({
      component: BriefTypeModalComponent,
      componentProps: {},
      cssClass: 'brief-type-modal'
    });

    modal.present();
  }

  async addWebinar() {
    const currentRoute = window.location.hash;
    if (currentRoute.includes('#/webinars/core-info')) return;
    this.router.navigate(['/webinars/core-info'], { replaceUrl: true });
  }

  async helpCenter() {
    const currentRoute = window.location.hash;
    if (currentRoute.includes('#/tutorial')) return;
    this.router.navigate(['/tutorial'], { replaceUrl: true });
  }

  async showProfileActions() {
    let createdActionSheet: any;
    const buttons: ActionSheetButton[] = [
      {
        text: this.translateService.instant('Logout'),
        icon: this.platform.is('ios') ? undefined : 'log-out',
        role: 'destructive',
        handler: () => this.logout()
      },
      {
        text: this.translateService.instant('Change language'),
        icon: this.platform.is('ios') ? undefined : 'globe',
        handler: async () => {
          // Wait for action sheet dismiss animation to finish, see "Dismissing And Async Navigation" section in:
          // http://ionicframework.com/docs/api/components/action-sheet/ActionSheetController/#advanced
          await createdActionSheet.dismiss();
          this.changeLanguage();
          return false;
        }
      },
      {
        text: this.translateService.instant('Cancel'),
        icon: this.platform.is('ios') ? undefined : 'close',
        role: 'cancel'
      }
    ];

    // On Cordova platform language is set to the device language
    if (this.platform.is('cordova')) {
      buttons.splice(1, 1);
    }

    const actionSheetOptions: ActionSheetOptions = {
      header: this.username || undefined,
      buttons
    };

    createdActionSheet = await this.actionSheetController.create(actionSheetOptions);
    createdActionSheet.present();
  }

  get username(): string | null {
    const credentials = this.credentialsService.credentials;
    return credentials ? credentials.username : null;
  }

  get impersonation(): boolean {
    return this.credentialsService.credentials.impersonation;
  }

  async backToAdminPanel() {
    this.isLoading = true;
    const adminInfo: any = {
      username: 'admin@xgrowth',
      impersonation: this.impersonation
    };
    const impersonate$ = this.authenticationService.impersonate(adminInfo);
    const loadingOverlay = await this.loadingController.create({});
    const loading$ = from(loadingOverlay.present());
    forkJoin([impersonate$, loading$])
      .pipe(
        map(([credentials, ...rest]) => credentials),
        finalize(() => {
          this.isLoading = false;
          loadingOverlay.dismiss();
        }),
        untilDestroyed(this)
      )
      .toPromise()
      .then(
        credentials => {
          log.debug(`${credentials.username} successfully logged in`);
          this.router.navigate(['/admin/users'], { replaceUrl: true }).then(() => {
            window.location.reload();
          });
        },
        error => {
          log.debug(`Login error: ${error}`);
          this.error = error;
        }
      );
  }

  logout() {
    this.loadBriefsService.resetService();
    this.navigationToll();
    this.authenticationService
      .logout()
      .toPromise()
      .then(() => this.router.navigate(['/login'], { replaceUrl: true }));
  }

  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }

  private async changeLanguage() {
    const alertController = await this.alertController.create({
      header: this.translateService.instant('Change language'),
      inputs: this.i18nService.supportedLanguages.map(language => ({
        type: 'radio' as TextFieldTypes,
        name: language,
        label: language,
        value: language,
        checked: language === this.i18nService.language
      })),
      buttons: [
        {
          text: this.translateService.instant('Cancel'),
          role: 'cancel'
        },
        {
          text: this.translateService.instant('Ok'),
          handler: language => {
            this.i18nService.language = language;
          }
        }
      ]
    });
    alertController.present();
  }
}
