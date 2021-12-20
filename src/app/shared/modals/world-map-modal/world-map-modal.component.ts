import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ICountry } from '@app/shared/models/country.model';
import { ViewMoreModalComponent } from '@app/shared/modals/view-more-modal/view-more-modal.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-world-map-modal',
  templateUrl: './world-map-modal.component.html',
  styleUrls: ['./world-map-modal.component.scss']
})
export class WorldMapModalComponent implements OnInit {
  @Input() organizationReach: ICountry[];
  /**
   * This listener will automatically dismiss this modal
   * and open list modal, after the viewport reaches 700px
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth <= 700 && !event.cancelBubble) this.switchToList(this.organizationReach, event);
  }

  constructor(private modalController: ModalController) {}

  ngOnInit(): void {}

  dismiss() {
    this.modalController.dismiss();
  }

  async switchToList(organizationReach: ICountry[], event?: any) {
    this.modalController.dismiss().then(async () => {
      event?.stopPropagation();
      (
        await this.modalController.create({
          component: ViewMoreModalComponent,
          cssClass: 'view-more-modal',
          componentProps: {
            items: organizationReach,
            type: 'organizationReach',
            modalTitle: 'Organization Reach'
          }
        })
      ).present();
    });
  }
}
