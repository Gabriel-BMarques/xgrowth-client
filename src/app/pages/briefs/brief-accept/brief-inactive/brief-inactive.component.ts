import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-brief-inactive',
  templateUrl: './brief-inactive.component.html',
  styleUrls: ['./brief-inactive.component.scss']
})
export class BriefInactiveComponent implements OnInit {
  constructor(private popoverController: PopoverController) {}

  ngOnInit(): void {}

  dismiss() {
    this.popoverController.dismiss();
  }
}
