import { Component, Input, OnInit } from '@angular/core';
import { IOrganization } from '@app/shared/models/organizations.model';
import { PopoverController } from '@ionic/angular';
import { ShareInXgrowthPopoverComponent } from './share-in-xgrowth-popover/share-in-xgrowth-popover.component';

@Component({
  selector: 'app-share-popover',
  templateUrl: './share-popover.component.html',
  styleUrls: ['./share-popover.component.scss']
})
export class SharePopoverComponent implements OnInit {
  @Input() organization: IOrganization;
  @Input() url: string;
  @Input('dismiss') dismiss: () => void;

  urlEncoded: string;

  copyClass: string = 'fa-link';
  constructor(private popoverController: PopoverController) {}

  ngOnInit(): void {
    this.urlEncoded = encodeURIComponent(this.url);
  }

  async shareInXGrowth() {
    this.dismiss();
    const popover: HTMLIonPopoverElement = await this.popoverController.create({
      component: ShareInXgrowthPopoverComponent,
      componentProps: {
        organizationId: this.organization._id,
        dismiss: () => popover.dismiss()
      },
      cssClass: 'share-organization-xgrowth-popover',
      showBackdrop: true,
      translucent: true
    });
    await popover.present();
  }

  copyAddress() {
    const input = document.createElement('textarea');
    input.innerHTML = this.url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    this.copyClass = 'fa-check';
    this.dismiss();
  }
}
