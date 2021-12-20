import { Component, OnInit, OnDestroy } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-modal-update',
  templateUrl: './modal-update.component.html',
  styleUrls: ['./modal-update.component.scss']
})
export class ModalUpdateComponent implements OnInit, OnDestroy {
  constructor(
    public popover: PopoverController,
    private navParams: NavParams,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {}

  ngOnDestroy() {}

  ok() {
    // this.router.navigateByUrl('/reactivate');
    this.popover.dismiss();
  }
}
