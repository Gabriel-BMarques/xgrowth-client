import { Component, Input, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-popover-leave-organization',
  templateUrl: './popover-leave-organization.component.html',
  styleUrls: ['./popover-leave-organization.component.scss']
})
export class PopoverLeaveOrganizationComponent implements OnInit {
  @Input() currentPage: any;
  fullPage: any;

  constructor(private popoverController: PopoverController, public params: NavParams) {}

  ngOnInit(): void {}

  cancel() {
    this.popoverController.dismiss(true);
  }

  discard() {
    this.popoverController.dismiss(false);
  }
}
