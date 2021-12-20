import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';
import { DataService } from '@app/services/data.service';
import { environment } from '@env/environment';
import { IUser } from '@app/shared/models/user.model';
import { IWebinar } from '@app/shared/models/webinar.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabGroup } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import { UserInfoService } from '@app/services/user-info.service';
import { ModalController } from '@ionic/angular';
import { ContactModalComponent } from '@app/shared/modals/contact-modal/contact-modal.component';

declare let woopra: any;

@Component({
  selector: 'app-webinars',
  templateUrl: './webinars.component.html',
  styleUrls: ['./webinars.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WebinarsComponent implements OnInit {
  @ViewChild('matTabGroup', { static: false }) matTabGroup: MatTabGroup;

  // state management
  selectedTab: string;
  loadingMyWebinars = false;
  loadingInvitations = false;
  queryParamSubscription: Subscription;

  // data
  currentUser: IUser;
  hasWebinarAccess: boolean;
  myWebinars: IWebinar[];
  myWebinarDates: Date[];
  invitations: any[];
  invitationDates: Date[];
  initialTab: string;

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private userInfoService: UserInfoService,
    private modalController: ModalController
  ) {}

  get userInfo(): any {
    return this.userInfoService.storedUserInfo;
  }

  async ngOnInit() {
    this.userInfoService.refreshUserInfo();
    this.loadingMyWebinars = true;
    let currentCompany;
    [this.currentUser, currentCompany] = (
      await Promise.all([this.dataService.getUserProfile().toPromise(), this.dataService.getUserCompany().toPromise()])
    ).map(res => res.body);
    this.hasWebinarAccess = currentCompany.hasWebinarAccess;
    this.loadingMyWebinars = false;

    if (environment.production) this.woopraIdentify(this.userInfo), this.woopraTrack(this.userInfo);

    this.initialTab = this.route.snapshot.queryParams?.tab || 'my webinars';

    if (this.initialTab === 'invitations' || !this.hasWebinarAccess) {
      this.initTab(1);
    } else {
      this.initTab(0);
      await this.switchTab({ tab: { textLabel: 'my webinars' } });
    }
  }

  public initTab(index: number) {
    const tabGroup = this.matTabGroup;
    if (!tabGroup || !(tabGroup instanceof MatTabGroup)) return;
    tabGroup.selectedIndex = index;
  }

  async switchTab(event: any) {
    this.selectedTab = event.tab.textLabel;
    if (this.selectedTab === 'my webinars') await this.loadMyWebinars();
    else await this.loadInvitations();
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

  addWebinar() {
    this.router.navigate(['/webinars/core-info'], { replaceUrl: true });
  }

  async loadMyWebinars() {
    this.loadingMyWebinars = true;
    const today = new Date();
    const webinars = (await this.dataService.list('/webinar', { createdBy: this.currentUser.id }).toPromise()).body;
    webinars.forEach((w: IWebinar) => (w.descriptionSlice = true));
    this.myWebinars = _.orderBy(webinars, webinar => webinar.eventDate, 'asc').filter(
      w => new Date(w.eventDate) >= today
    );

    this.myWebinarDates = _.uniqWith(
      this.myWebinars.map(webinar => new Date(webinar.eventDate).toDateString()),
      _.isEqual
    );

    this.loadingMyWebinars = false;
  }

  async loadInvitations() {
    this.loadingInvitations = true;
    let { organization } = this.route.snapshot.queryParams;
    let query = organization ? { organization } : {};
    const invitations = (await this.dataService.list('/webinar-invitation/logged', query).toPromise()).body;
    console.log(invitations);
    invitations.forEach(inv => (inv.webinarId.descriptionSlice = true));
    this.invitations = _.orderBy(invitations, inv => inv.webinarId.eventDate, 'asc');

    this.invitationDates = _.uniqWith(
      this.invitations.map(inv => new Date(inv.webinarId.eventDate).toDateString()),
      _.isEqual
    );

    this.loadingInvitations = false;
  }

  woopraIdentify(user: any) {
    woopra
      .identify({
        email: user.email,
        id: user.email,
        name: `${user.firstName} ${user.familyName}`,
        firstname: user.firstName,
        familyname: user.familyName,
        company: user.company?.companyName,
        department: user.department,
        jobTitle: user.jobTitle
      })
      .push();
  }
  woopraTrack(user: any) {
    woopra.track('webinars view', {
      author: user.email,
      id: user.email,
      name: user.email,
      company: user.company.companyName,
      department: user.department,
      jobTitle: user.jobTitle,
      topic: 'Webinars Visualization',
      title: document.title,
      url: window.location.href
    });
  }

  isSameDate(date1: any, date2: any) {
    return new Date(date1).toDateString() === new Date(date2).toDateString();
  }
}
