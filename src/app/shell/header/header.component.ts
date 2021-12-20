import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, CredentialsService } from '@app/core';
import { DataService } from '@app/services/data.service';
import { HeaderService } from '@app/services/header.service';
import { MockService } from '@app/services/mock.service';
import { NavigationService } from '@app/services/navigation.service';
import { NotificationService } from '@app/services/notification.service';
import { PanelData } from '@app/shared/models/panelData.model';
import { ActionSheetController, Events, Platform, PopoverController } from '@ionic/angular';
import { ActionSheetButton, ActionSheetOptions } from '@ionic/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageComponent } from './language/language.component';
import { ModalComponent } from './modal/modal.component';
import { ProfilePopoverComponent } from './profile-popover/profile-popover.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {
  panelDataNotifications: PanelData;
  panelDataMessages: PanelData;
  user: any;
  segment: any;
  currentCompany: any;
  loadedUserInfo = false;
  userRole: any;
  notificationCounter: number = 0;

  get username(): string | null {
    const credentials = this.credentialsService.credentials;
    return credentials ? credentials.username : null;
  }

  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }
  header: string;

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private platform: Platform,
    private actionSheetController: ActionSheetController,
    private authenticationService: AuthenticationService,
    private credentialsService: CredentialsService,
    public headerService: HeaderService,
    private dataService: DataService,
    public popoverController: PopoverController,
    private mockService: MockService,
    private navigationService: NavigationService,
    private notificationService: NotificationService,
    public events: Events
  ) {
    events.subscribe('logo:update', () => {
      this.loadCompany();
    });
  }

  async ngOnInit() {
    await this.dataService
      .getUserInfo()
      .toPromise()
      .then(res => {
        this.user = res.body;
        this.userRole = res.body.role;
      });

    await this.loadCompany();

    this.loadedUserInfo = true;

    this.panelDataNotifications = {
      type: 'notifications',
      name: 'Notifications',
      items: []
    };

    this.panelDataMessages = this.mockService.generateMessages();
    this.countNotifications();
  }

  async navigationToll(title?: string) {
    const currentPath = window.location.hash;
    this.navigationService.clearWizardData(currentPath);
  }

  async loadCompany() {
    await this.dataService
      .getUserCompany()
      .toPromise()
      .then(res => {
        this.currentCompany = res.body;
      });
  }

  async countNotifications() {
    this.notificationCounter = await this.notificationService.notificationCounter();
  }

  startCounterByInterval() {
    const minute = 1000 * 60;
    const interval = minute * 2;
    setInterval(() => {
      this.countNotifications();
    }, interval);
  }

  async changeLanguage(ev: any) {
    const popover = await this.popoverController.create({
      component: LanguageComponent,
      event: ev,
      cssClass: 'language'
    });
    return popover.present();
  }

  async showProfileActions() {
    let createdActionSheet: any;
    const buttons: ActionSheetButton[] = [
      {
        text: this.translateService.instant('Logout'),
        icon: this.platform.is('ios') ? undefined : 'log-out',
        role: 'destructive',
        handler: () => {
          this.popoverController.dismiss();
          this.logout();
        }
      },
      {
        text: this.translateService.instant('Change language'),
        icon: this.platform.is('ios') ? undefined : 'globe',
        handler: async () => {
          // Wait for action sheet dismiss animation to finish, see "Dismissing And Async Navigation" section in:
          // http://ionicframework.com/docs/api/components/action-sheet/ActionSheetController/#advanced
          await createdActionSheet.dismiss();
          // this.changeLanguage();
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

  async openNotificationsModal(ev: any) {
    const modal = await this.popoverController.create({
      component: ModalComponent,
      componentProps: { modalData: this.panelDataNotifications },
      cssClass: 'notification-modal',
      event: ev
    });

    modal.onDidDismiss().then(() => {
      this.countNotifications();
    });
    return modal.present();
  }

  async openOrganizationProfileModal(ev: any) {
    const modal = await this.popoverController.create({
      component: ProfilePopoverComponent,
      cssClass: 'organization-profile-popover',
      event: ev
    });
    return modal.present();
  }

  async openMessagesModal(ev: any) {
    const modal = await this.popoverController.create({
      component: ModalComponent,
      componentProps: { modalData: this.panelDataMessages },
      event: ev
    });
    return modal.present();
  }

  async openProfileModal(ev: any) {
    const modal = await this.popoverController.create({
      component: ModalComponent,
      componentProps: { type: 'profile', name: 'Profile Modal', user: this.user },
      cssClass: 'profile-modal',
      event: ev
    });
    return modal.present();
  }

  private logout() {
    this.authenticationService
      .logout()
      .toPromise()
      .then(() => this.router.navigate(['/login'], { replaceUrl: true }));
  }

  get currentRoute() {
    return window.location.hash;
  }
}
