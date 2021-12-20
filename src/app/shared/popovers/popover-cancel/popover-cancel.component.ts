import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-popover-cancel',
  templateUrl: './popover-cancel.component.html',
  styleUrls: ['./popover-cancel.component.scss']
})
export class PopoverCancelComponent implements OnInit {
  @Input() complete: boolean;
  constructor(private popoverController: PopoverController) {}

  ngOnInit() {}

  no() {
    const status = false;
    this.popoverController.dismiss(status);
  }

  yes() {
    const status = true;
    this.popoverController.dismiss(status);
  }
}
