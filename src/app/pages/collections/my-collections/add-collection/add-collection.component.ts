import { Component, OnInit, ViewEncapsulation, ViewChild, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavParams, PopoverController } from '@ionic/angular';
import { Collection } from '@app/shared/models/collections.model';
import { DataService } from '@app/services/data.service';

@Component({
  selector: 'app-add-collection',
  templateUrl: './add-collection.component.html',
  styleUrls: ['./add-collection.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddCollectionComponent implements OnInit {
  @Input() email: string;
  @Input() postId: string;
  collectionForm: FormGroup;
  collection: Collection;

  constructor(
    navParams: NavParams,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    public popover: PopoverController
  ) {
    this.createForm();
  }

  ngOnInit() {}

  // tslint:disable-next-line: member-ordering
  onCancel() {
    this.popover.dismiss('cancel');
  }

  onCreate() {
    this.collection = new Collection();
    this.collection.Name = this.collectionForm.controls.collectionName.value;
    if (this.postId) {
      this.collection.postsIds = [];
      this.collection.postsIds.push(this.postId);
    }
    this.dataService
      .create('/collections', this.collection)
      .toPromise()
      .then(() => {});
    this.collectionForm.controls.collectionName.markAsTouched();
    if (this.collectionForm.valid) this.popover.dismiss('create');
  }

  private createForm() {
    this.collectionForm = this.formBuilder.group({
      collectionName: ['', Validators.required]
    });
  }
}
