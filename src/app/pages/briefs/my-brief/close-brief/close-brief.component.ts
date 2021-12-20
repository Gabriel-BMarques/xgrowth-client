import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { DataService } from '@app/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { IBrief } from '@app/shared/models/brief.model';

@Component({
  selector: 'app-close-brief',
  templateUrl: './close-brief.component.html',
  styleUrls: ['./close-brief.component.scss']
})
export class CloseBriefComponent implements OnInit, OnDestroy {
  companies: any[] = [];
  brief: IBrief;
  id: string;
  constructor(
    public popover: PopoverController,
    private navParams: NavParams,
    private dataService: DataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // this.dataService
    //   .listById('/brief-supplier', this.id)
    //   .toPromise()
    //   .then(briefSuppliers => {
    //     this.companies = briefSuppliers.body.map(briefSupplier => {
    //       return briefSupplier.SupplierId;
    //     });
    //   });
  }

  ngOnDestroy() {}

  cancel() {
    this.popover.dismiss(this.brief.isActive);
  }

  send() {
    this.dataService
      .update('/brief', this.brief)
      .toPromise()
      .then(() => {});

    this.popover.dismiss(false);
  }
}
