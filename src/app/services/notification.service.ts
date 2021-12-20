import { Injectable } from '@angular/core';
import { IUser } from '@app/shared/models/user.model';
import { DataService } from './data.service';
import { MailService } from './mail.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private dataService: DataService, private mailService: MailService) {}

  // NOTIFICATIONS
  sendBriefDeclineNotification(brief: any, company: any) {
    const notificationData = {
      type: 'brief-decline-notification',
      brief,
      company
    };

    this.dataService
      .create('/notification', notificationData)
      .toPromise()
      .then(() => {});
  }

  async sendBriefUploadNotification(brief: any, company: any, receiversIDs: string[]) {
    const notificationData = {
      type: 'brief-nda-upload',
      brief,
      company,
      receiversIDs
    };

    this.dataService
      .create('/notification', notificationData)
      .toPromise()
      .then(() => {});
  }

  async sendBriefNDAAcceptanceNotification(itemSelected: any, arrayAccepted: any[]) {
    const briefSupplier = itemSelected;

    const notificationData = {
      type: 'brief-nda-acceptance',
      briefSupplier
    };

    this.dataService
      .update('/brief-supplier', itemSelected)
      .toPromise()
      .then(res => {
        arrayAccepted.push(res.body);
      });

    this.dataService
      .create('/notification', notificationData)
      .toPromise()
      .then(() => {});
  }

  async sendBriefNDADeclineNotification(itemSelected: any) {
    const briefSupplier = itemSelected;

    const notificationData = {
      type: 'brief-nda-decline',
      briefSupplier
    };

    this.dataService
      .create('/notification', notificationData)
      .toPromise()
      .then(() => {});
  }

  async sendPostShareNotification(user: any, postId: string, coworker: any) {
    const notificationData = {
      type: 'post-share',
      user,
      postId,
      coworker
    };

    this.dataService
      .create('/notification', notificationData)
      .toPromise()
      .then(() => {});
  }

  sendOrganizationShareNotification(user: IUser, organizationId: string, coworkerId: string) {
    const notificationData = {
      type: 'organization-share',
      user,
      organizationId,
      coworkerId
    };

    return this.dataService.create('/notification', notificationData);
  }

  async sendNewBriefNotifications(solvers: any[], brief: any, previouslyPublished: boolean) {
    const notificationData = {
      type: 'new-brief',
      solvers,
      brief,
      previouslyPublished
    };

    this.dataService
      .create('/notification', notificationData)
      .toPromise()
      .then(() => {});
  }

  async sendNewPostNotifications(post: any, userCompany: any) {
    const notificationData = {
      type: 'new-post',
      post,
      userCompany
    };

    await this.dataService
      .create('/notification', notificationData)
      .toPromise()
      .then(res => console.log(res))
      .catch(err => console.log(err));
  }

  async sendBriefAcceptNotification(briefId: string) {
    const notificationData = {
      type: 'brief-accept',
      briefId
    };

    this.dataService
      .create('/notification', notificationData)
      .toPromise()
      .then(() => {});
  }

  sendBriefChangesNotification(briefChanges: string[], brief: any) {
    const notificationData = {
      type: 'brief-changes',
      briefChanges,
      brief
    };
    this.dataService
      .create('/notification', notificationData)
      .toPromise()
      .then(() => {});
  }

  sendBriefResponseNotification(briefResponse: string) {
    const notificationData = {
      type: 'brief-response',
      briefResponse
    };
    this.dataService
      .create('/notification', notificationData)
      .toPromise()
      .then(() => {});
  }

  sendWelcomeNotification(user: any) {
    const notificationData = {
      type: 'welcome-email',
      user
    };
    this.dataService
      .create('/notification', notificationData)
      .toPromise()
      .then(() => {});
  }

  sendPostRatingAnsweredNotification(user: any, post: any) {
    const notificationData = {
      type: 'post-rating-answered',
      user,
      post
    };
    this.dataService
      .create('/notification', notificationData)
      .toPromise()
      .then(() => {});
  }

  sendNewPostRatingNotification(user: any, post: any) {
    const notificationData = {
      type: 'new-post-rating',
      user,
      post
    };
    this.dataService
      .create('/notification', notificationData)
      .toPromise()
      .then(() => {});
  }

  async notificationCounter(): Promise<number> {
    let notificationCounter: number;
    await this.dataService
      .count('/notification-user')
      .toPromise()
      .then(notifications => {
        notificationCounter = notifications.body;
      });
    return notificationCounter;
  }
}
