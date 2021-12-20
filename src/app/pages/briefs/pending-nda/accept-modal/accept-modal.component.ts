import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { IItem } from '@app/shared/models/item.model';
import { DataService } from '@app/services/data.service';
import { PushNotificationService } from '@app/services/push-notification.service';
import { INotification, Notification } from '@app/shared/models/notification.model';
import { MailService } from '@app/services/mail.service';
import { environment } from '@env/environment';
import { NotificationService } from '@app/services/notification.service';

@Component({
  selector: 'app-accept-modal',
  templateUrl: './accept-modal.component.html',
  styleUrls: ['./accept-modal.component.scss']
})
export class AcceptModalComponent implements OnInit, OnDestroy {
  arrayAccepted: any[] = [];
  itemSelected: any;

  constructor(
    public popover: PopoverController,
    private navParams: NavParams,
    private dataService: DataService,
    private mailService: MailService,
    private notificationService: NotificationService
  ) {
    this.arrayAccepted = this.navParams.get('array');
    this.itemSelected = this.navParams.get('selected');
  }

  ngOnInit() {}

  ngOnDestroy() {}

  send() {
    this.itemSelected.NdaAcceptance = 1;
    this.notificationService.sendBriefNDAAcceptanceNotification(this.itemSelected, this.arrayAccepted);
    this.popover.dismiss();
  }

  sendEmail(email: string, briefTitle: string) {
    const mailData = {
      userEmail: email,
      brief: briefTitle
    };
    this.mailService
      .sendMessage('nda-acceptance', mailData)
      .toPromise()
      .then(() => {});
  }
}
