import { Router } from '@angular/router';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { IWebinar } from '@app/shared/models/webinar.model';
import { DataService } from '@app/services/data.service';
import { AlertController, IonSlides, ModalController } from '@ionic/angular';
import { CredentialsService } from '@app/core';
import { ModalWebinarReview } from '../webinar-details/modal-webinar-review.component';
import { ImageModalComponent } from '@app/shared/modals/image-modal/image-modal.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-webinar-card',
  templateUrl: './webinar-card.component.html',
  styleUrls: ['./webinar-card.component.scss']
})
export class WebinarCardComponent implements OnInit {
  @Input() inputEntity: any;
  @Input() type: string;

  //slides
  @ViewChild('slides') slides: IonSlides;
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };
  active: number = 0;

  //state management
  currentModal: any;
  attendanceControl: FormControl = new FormControl('');

  //data
  webinar: IWebinar;

  constructor(
    private router: Router,
    private dataService: DataService,
    private alertController: AlertController,
    private credentialsService: CredentialsService,
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    if (this.type === 'my-webinar') {
      this.webinar = this.inputEntity;
    } else if (this.type === 'invitation') {
      this.webinar = this.inputEntity.webinarId;
      this.getAttendanceStatus(this.inputEntity);
    }
  }

  getAttendanceStatus(invitation: any) {
    if (invitation.status === 'attending') {
      this.attendanceControl.setValue('yes');
    } else if (invitation.status === 'not attending') {
      this.attendanceControl.setValue('no');
    }
  }

  async showReview(entity: IWebinar) {
    if (entity.reviewStatus === 'pending') return;
    const modal = this.modalController.create({
      component: ModalWebinarReview,
      cssClass: 'modal-review-class',
      componentProps: {
        webinar: entity
      }
    });
    (await modal).present();
    this.currentModal = modal;
    (await modal).onDidDismiss();
  }

  canEdit(webinarReviewStatus: string) {
    return webinarReviewStatus !== 'approved' || this.credentialsService.checkRole === 'admin';
  }

  getWebinarDescription(description: string, slice?: boolean) {
    return slice ? description.slice(0, 250) : description;
  }

  editMyWebinar(webinar: IWebinar) {
    this.alertController
      .create({
        cssClass: 'alertConfirmation',
        header: 'Are you sure?',
        message:
          "Once you edit your webinar, it will be re-submitted for review, even if you don't change any parameters!",
        buttons: [
          {
            text: 'confirm',
            cssClass: 'confirmation-discardButton',
            handler: async () => {
              this.router.navigate(['/webinars/core-info/edit/', webinar._id], { replaceUrl: true });
            }
          },
          {
            text: 'cancel',
            cssClass: 'confirmation-cancelButton',
            role: 'cancel'
          }
        ]
      })
      .then(alert => {
        alert.present();
      });
  }
  getEventDate(webinar: IWebinar, option?: string) {
    const eventDate = option && option === 'end' ? new Date(webinar.eventEndDate) : new Date(webinar.eventDate);
    const { offset } = webinar.eventTimezone;
    const hours = eventDate.getUTCHours() - offset;
    eventDate.setHours(hours);
    return eventDate;
  }

  getOffset(timezone: any) {
    const offset = timezone.split(/[(())]/)[1];
    return offset;
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

  getContainerName(url: string) {
    return url
      .split('https://weleverimages.blob.core.windows.net/')
      .pop()
      .split('/')[0];
  }

  getBlobName(url: string) {
    const blobName = url.split('https://weleverimages.blob.core.windows.net/').pop();
    const extension = url.split('.').pop();
    const fileName = blobName.split('.', 1);
    const newBlobName = `${fileName}-SM.${extension}`;
    return newBlobName;
  }

  async invitationAttendance(option: string, invitation: any) {
    if (option === 'yes') await this.willAttend(invitation);
    if (option === 'no') await this.willNotAttend(invitation);
  }

  async willAttend(invitation: any) {
    invitation.status = 'attending';
    try {
      invitation = (await this.dataService.update('/webinar-invitation', invitation).toPromise()).body;
    } catch {
      invitation.status = 'invited';
    }
  }
  async willNotAttend(invitation: any) {
    invitation.status = 'not attending';
    try {
      invitation = (await this.dataService.update('/webinar-invitation', invitation).toPromise()).body;
    } catch {
      invitation.status = 'invited';
    }
  }

  //gallery methods begin
  isImage(file: any): boolean {
    if (file.isImage) return true;
    if (file.url) {
      const splitArray = file.url.toString().split('.');
      const fileExtention = splitArray[splitArray.length - 1];
      return fileExtention === 'png' || fileExtention === 'jpg' || fileExtention === 'webp'; // added webp
    }
  }

  async onSlideChange() {
    this.active = await this.slides.getActiveIndex();
  }

  fallbackImage(file: any) {
    if (file) {
      file.url = 'https://picsum.photos/id/122/130/160';
      return file.url;
    }
  }

  async openGallery(uploadedFiles: any) {
    const modal = await this.modalController.create({
      component: ImageModalComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        uploadedFiles: uploadedFiles
      }
    });
    modal.present();
  }
}
