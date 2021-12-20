import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-interests-complete-popover',
  templateUrl: './interests-complete-popover.component.html',
  styleUrls: ['./interests-complete-popover.component.scss']
})
export class InterestsCompletePopoverComponent implements OnInit {
  constructor(private popoverController: PopoverController) {}

  ngOnInit(): void {}

  dismiss(): void {
    this.popoverController.dismiss();
  }
}
