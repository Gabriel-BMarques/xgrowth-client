import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { AlertController, ModalController } from '@ionic/angular';
import { ModalWebinarDetailsComponent } from './modal-webinar-details/modal-webinar-details.component';
import { IWebinar } from '@app/shared/models/webinar.model';
import { Router } from '@angular/router';
import { ModalGuestListComponent } from './modal-guest-list/modal-guest-list.component';
import { ModalWebinarDenialComponent } from './modal-webinar-denial/modal-webinar-denial.component';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-webinars',
  templateUrl: './webinars.component.html',
  styleUrls: ['./webinars.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WebinarsComponent implements OnInit {
  isLoading = false;
  skeletonLoading = true;
  currentModal: any;

  webinars: IWebinar[];
  webinarsAux: IWebinar[];

  reviewStatuses: string[] = ['pending', 'approved', 'denied'];

  isApp: boolean = false;
  showTooltipInfo: boolean = false;

  constructor(
    private modalController: ModalController,
    private dataService: DataService,
    public alertController: AlertController,
    private router: Router,
    public platform: Platform
  ) {}

  async ngOnInit() {
    if (this.platform.is('desktop')) {
      this.isApp = false;
    } else {
      this.isApp = true;
    }
    await this.fetchWebinars();
  }

  async fetchWebinars() {
    this.skeletonLoading = true;
    this.webinars = (await this.dataService.list('/webinar').toPromise()).body;
    this.webinars.forEach(w => (w.editingStatus = false));
    this.webinarsAux = this.webinars;
    this.skeletonLoading = false;
  }

  startStatusEdit(item?: any) {
    if (!item?.isPublished) return;
    item.editingStatus = true;
  }

  toggleTooltipInfo() {
    this.showTooltipInfo = !this.showTooltipInfo;
  }

  async changeStatus($event: any, webinar: IWebinar) {
    if ($event.value === 'approved') {
      await this.approve(webinar);
    } else if ($event.value === 'denied') {
      await this.deny(webinar);
    } else {
      webinar.editingStatus = false;
    }
  }

  async approve(entity: IWebinar) {
    this.alertController
      .create({
        cssClass: 'alertConfirmation',
        header: 'Are you sure?',
        message: 'Approving will send this webinar invitation to all guests on list!',
        buttons: [
          {
            text: 'confirm',
            cssClass: 'confirmation-discardButton',
            handler: async () => {
              await this.dataService.approveWebinar(entity).toPromise();
              entity.editingStatus = false;
              this.fetchWebinars();
            }
          },
          {
            text: 'cancel',
            cssClass: 'confirmation-cancelButton',
            role: 'cancel',
            handler: () => (entity.editingStatus = false)
          }
        ]
      })
      .then(alert => {
        alert.present();
      });
  }

  async deny(entity: IWebinar) {
    const modal = this.modalController.create({
      component: ModalWebinarDenialComponent,
      cssClass: 'review-modal-class',
      componentProps: {
        webinarId: entity._id
      }
    });
    (await modal).present();
    this.currentModal = modal;
    (await modal).onDidDismiss().then(() => {
      entity.editingStatus = false;
      this.fetchWebinars();
    });
  }

  applyFilter(filterValue: string) {
    if (filterValue === null) {
      this.webinars = this.webinarsAux;
      return;
    }

    filterValue = filterValue.trim().toLowerCase();
    this.webinars = this.webinarsAux.filter(tutorial =>
      tutorial.title
        .trim()
        .toLowerCase()
        .includes(filterValue)
    );
  }

  async editWebinar(webinarId: string) {
    await this.router.navigate(['/webinars/core-info/edit/', webinarId]);
  }

  async reviewWebinar(entity?: any) {
    const modal = this.modalController.create({
      component: ModalWebinarDetailsComponent,
      cssClass: 'review-modal-class',
      componentProps: {
        webinarId: entity._id
      }
    });
    (await modal).present();
    this.currentModal = modal;
    (await modal).onDidDismiss();
  }

  async openGuestList(entity?: any) {
    const modal = this.modalController.create({
      component: ModalGuestListComponent,
      cssClass: 'review-modal-class',
      componentProps: {
        webinarId: entity._id
      }
    });
    (await modal).present();
    this.currentModal = modal;
    (await modal).onDidDismiss();
  }
}
