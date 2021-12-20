import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-brief-modal-decline',
  templateUrl: './brief-modal-decline.component.html',
  styleUrls: ['./brief-modal-decline.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BriefModalDeclineComponent implements OnInit, OnDestroy {
  isDeclined: boolean;
  declineThis: string;
  youWont: string;
  undo: string;
  cancel: string;
  decline: string;

  constructor(public popover: PopoverController, private navParams: NavParams) {}

  ngOnInit() {
    this.isDeclined = this.navParams.get('declined');
  }

  ngOnDestroy() {}

  onDecline() {
    this.isDeclined = true;
    this.popover.dismiss(this.isDeclined);
  }

  onCancel() {
    this.popover.dismiss();
  }
}
