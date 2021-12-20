import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/core';
import { DataService } from '@app/services/data.service';
import { UserInfoService } from '@app/services/user-info.service';
import { PanelData } from '@app/shared/models/panelData.model';
import { environment } from '@env/environment';
import { NavParams, PopoverController } from '@ionic/angular';
import { LanguageComponent } from '../language/language.component';

declare let woopra: any;

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  panelData: PanelData;
  profileName: string;
  profileCompany: string;
  type: string;
  user: any;
  isLoading = false;
  options: boolean = false;
  option: any = null;
  isHour: boolean;
  isHourArray: boolean[] = [];

  constructor(
    private dataService: DataService,
    public navParams: NavParams,
    private authenticationService: AuthenticationService,
    private router: Router,
    private popoverController: PopoverController,
    private userInfoService: UserInfoService
  ) {
    this.panelData = this.navParams.get('modalData');
    this.profileName = this.navParams.get('name');
    this.user = this.navParams.get('user');
    this.type = this.navParams.get('type');
  }

  get userInfo(): any {
    return this.userInfoService.storedUserInfo;
  }

  async ngOnInit() {
    this.userInfoService.refreshUserInfo();
    if (this.panelData.type === 'notifications') {
      this.isLoading = true;
      await this.loadNotifications();
      this.isLoading = false;
    }
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
    woopra.track('notifications view', {
      author: user.email,
      id: user.email,
      name: user.email,
      company: user.company.companyName,
      department: user.department,
      jobTitle: user.jobTitle,
      topic: 'Notifications Visualization',
      title: document.title,
      url: window.location.href
    });
  }

  async loadNotifications() {
    if (environment.production) this.woopraIdentify(this.userInfo), this.woopraTrack(this.userInfo);
    this.panelData.items = [];
    const notificationsUser: HttpResponse<any[]> = await this.dataService.list('/notification-user').toPromise();
    let items = notificationsUser.body.length > 0 ? notificationsUser.body : [];
    items.forEach(async item => {
      if (item.briefId) {
        if (item.briefId.UploadedFiles[0]) {
          item.src = this.getResizedUrl(item.briefId.UploadedFiles[0]);
        }
      } else if (item.postId) {
        if (item.postId.UploadedFiles[0]) {
          item.src = this.getResizedUrl(item.postId.UploadedFiles[0]);
        }
      } else if (item.webinarId) {
        if (item.webinarId.uploadedFiles[0]) {
          item.src = this.getResizedUrl(item.webinarId.uploadedFiles[0]);
        }
      } else if (item.organizationId?.logo) {
        item.src = this.getResizedUrl(item.organizationId?.logo);
      } else {
        const sourceEntityId = item.link.split('/').sort((a: string, b: string) => {
          return b.length - a.length;
        })[0];
        if (item.link.includes('brief')) {
          try {
            const brief = (await this.dataService.find('/brief', sourceEntityId).toPromise()).body;
            item.src = brief.UploadedFiles[0] ? this.getResizedUrl(brief.UploadedFiles[0]) : '';
          } catch (err) {
            this.deleteNotification(item);
          }
        } else if (item.link.includes('post')) {
          try {
            const post = (await this.dataService.find('/post', sourceEntityId).toPromise()).body;
            item.src = post.UploadedFiles[0] ? this.getResizedUrl(post.UploadedFiles[0]) : '';
          } catch (err) {
            this.deleteNotification(item);
          }
        }
      }
    });
    items = items.filter(item => item.display);
    this.panelData.items = items;
  }

  getResizedUrl(file: any) {
    const container = this.getContainerName(file.url);
    if (container === 'cblx-img') {
      if (file.Type === 'gif') {
        return file.url;
      } else {
        return `${file.url}-SM`;
      }
    } else if (container === 'app-images') {
      const blobName = this.getBlobName(file.url);
      return `https://weleverimages.blob.core.windows.net/${blobName}`;
    }
  }

  getBlobName(url: string) {
    const blobName = url.split('https://weleverimages.blob.core.windows.net/').pop();
    const extension = url.split('.').pop();
    const fileName = blobName.split('.', 1);
    const newBlobName = `${fileName}-SM.${extension}`;
    return newBlobName;
  }

  getContainerName(url: string) {
    return url
      .split('https://weleverimages.blob.core.windows.net/')
      .pop()
      .split('/')[0];
  }

  ionViewWillEnter() {}

  fallbackImage(item: any) {
    item.UploadedFiles[0].url = 'https://picsum.photos/id/122/130/160';
  }

  async changeLanguage(ev: any) {
    const popover = await this.popoverController.create({
      component: LanguageComponent,
      event: ev,
      cssClass: 'language'
    });
    return popover.present();
  }

  toggleOptions() {
    this.options = !this.options;
  }

  setOption(id: any) {
    this.option = id;
    console.log(this.option);
  }

  unsetOption() {
    this.option = null;
  }

  async readAllNotifications() {
    this.isLoading = true;
    await this.dataService.update('/notification-user/read-all', {}).toPromise();

    await this.loadNotifications();
    this.isLoading = false;
    this.options = false;
  }

  async hideAllNotifications() {
    this.isLoading = true;
    await this.dataService
      .update('/notification-user/hide-all', {})
      .toPromise()
      .then(res => {
        this.panelData.items = [];
      });
    this.isLoading = false;
    this.options = false;
  }

  readNotification(notification: any) {
    notification.read = true;
    this.option = null;
    this.dataService.update('/notification-user', notification).toPromise();
  }

  unreadNotification(notification: any) {
    notification.read = false;
    this.option = null;
    this.dataService.update('/notification-user', notification).toPromise();
  }

  deleteNotification(notification: any) {
    notification.display = false;
    this.option = null;
    this.dataService.update('/notification-user', notification).toPromise();

    let removeIndex = this.panelData.items.map((item: any) => item._id).indexOf(notification._id);
    this.panelData.items.splice(removeIndex, 1);
  }

  isExternalURL(str: string) {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ); // fragment locator
    return !!pattern.test(str);
  }

  navigateToNotification(notification: any) {
    this.readNotification(notification);
    if (this.isExternalURL(notification.link)) {
      window.open(encodeURI(notification.link), '_blank');
    } else {
      this.router.navigateByUrl(notification.link, { replaceUrl: true }).then(() => {
        this.popoverController.dismiss();
      });
    }
  }
}
