import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-response-sent-confirmation',
  templateUrl: './response-sent-confirmation.component.html',
  styleUrls: ['./response-sent-confirmation.component.scss']
})
export class ResponseSentConfirmationComponent implements OnInit {
  constructor(private popover: PopoverController) {}

  ngOnInit(): void {}

  ok() {
    this.popover.dismiss();
  }
}
