import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { NotificationService } from '@app/services/notification.service';
import { UserInfoService } from '@app/services/user-info.service';
import { OrganizationShare } from '@app/shared/models/organizationShare.model';
import { IUser } from '@app/shared/models/user.model';
import { forkJoin, Observable, Subscription } from 'rxjs';
@Component({
  selector: 'app-share-in-xgrowth-popover',
  templateUrl: './share-in-xgrowth-popover.component.html',
  styleUrls: ['./share-in-xgrowth-popover.component.scss']
})
export class ShareInXgrowthPopoverComponent implements OnInit {
  selectedCoworkersIds: string[];
  coworkers: IUser[];
  observable: Subscription;
  @Input() organizationId: string;
  @Input('dismiss') dismiss: () => void;

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    private userInfoService: UserInfoService
  ) {}

  async ngOnInit() {
    await this.dataService
      .listCoworkers()
      .toPromise()
      .then(coworkers => {
        this.coworkers = coworkers.body;
      });
  }

  share() {
    const observables: Observable<any>[] = this.selectedCoworkersIds.map(coworkerId => {
      let organizationShare = new OrganizationShare();

      organizationShare = {
        organizationId: this.organizationId,
        recipientId: coworkerId
      };

      return this.notificationService.sendOrganizationShareNotification(
        this.userInfoService.storedUserInfo,
        this.organizationId,
        coworkerId
      );
    });
    this.observable = forkJoin(observables).subscribe();
    this.dismiss();
  }

  IonWillLeave() {
    this.observable.unsubscribe();
  }
}
