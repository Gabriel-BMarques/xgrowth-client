import { OnInit, OnDestroy, Component, Input } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { ICollection } from '@app/shared/models/collections.model';
import { DataService } from '@app/services/data.service';

@Component({
  selector: 'app-delete-collection',
  templateUrl: './delete-collection.component.html',
  styleUrls: ['./delete-collection.component.scss']
})
export class DeleteCollectionComponent implements OnInit {
  @Input() collection: ICollection;

  constructor(public popover: PopoverController, private navParams: NavParams, private dataService: DataService) {}

  ngOnInit() {}

  cancel() {
    this.popover.dismiss();
  }

  delete() {
    this.dataService
      .remove('/collections', this.collection)
      .toPromise()
      .then(() => {
        this.popover.dismiss();
      });
  }
}
