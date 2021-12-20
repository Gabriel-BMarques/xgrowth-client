import { Component, Input, OnInit } from '@angular/core';
import { MailService } from '@app/services/mail.service';
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-refer-solver-popover',
  templateUrl: './refer-solver-popover.component.html',
  styleUrls: ['./refer-solver-popover.component.scss']
})
export class ReferSolverPopoverComponent implements OnInit {
  @Input() complete: boolean;
  constructor(
    private popoverController: PopoverController,
    private mailService: MailService,
    private translate: TranslateService
  ) {}

  ngOnInit() {}

  no() {
    const status = 1;
    this.popoverController.dismiss(status);
  }

  yes() {
    const status = 0;
    this.popoverController.dismiss(status);
  }
}
