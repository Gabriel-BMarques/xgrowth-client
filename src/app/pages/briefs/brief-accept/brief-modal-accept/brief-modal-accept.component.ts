import { Component, ViewEncapsulation, OnInit, OnDestroy, Input } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { NotificationService } from '@app/services/notification.service';

@Component({
  selector: 'app-brief-modal-accept',
  templateUrl: './brief-modal-accept.component.html',
  styleUrls: ['./brief-modal-accept.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BriefModalAcceptComponent implements OnInit, OnDestroy {
  isAccepted: boolean;
  @Input() briefId: string;

  constructor(
    public popover: PopoverController,
    private navParams: NavParams,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.isAccepted = this.navParams.get('accepted');
  }

  ngOnDestroy() {}

  onAccept() {
    this.isAccepted = true;
    this.notificationService.sendBriefAcceptNotification(this.briefId);
    this.popover.dismiss(this.isAccepted);
  }

  onCancel() {
    this.popover.dismiss();
  }
}
