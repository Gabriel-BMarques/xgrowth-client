import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-incomplete-organization-popover',
  templateUrl: './incomplete-organization-popover.component.html',
  styleUrls: ['./incomplete-organization-popover.component.scss']
})
export class IncompleteOrganizationPopoverComponent implements OnInit {
  @Input() organizationAdmin: boolean;
  @Input() organizationId: string;

  constructor(private popoverController: PopoverController, private router: Router) {}

  ngOnInit(): void {}

  dismiss() {
    this.popoverController.dismiss();
  }

  completeProfile() {
    this.popoverController.dismiss();
    this.router.navigate(['/organization/' + this.organizationId + '/overview'], { replaceUrl: true });
  }
}
