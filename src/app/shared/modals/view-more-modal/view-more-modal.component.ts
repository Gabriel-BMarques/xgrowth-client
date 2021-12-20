import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { debounceTime } from 'rxjs/operators';
import { WorldMapModalComponent } from '../world-map-modal/world-map-modal.component';
import { ICountry } from '../../models/country.model';

@Component({
  selector: 'app-view-more-modal',
  templateUrl: './view-more-modal.component.html',
  styleUrls: ['./view-more-modal.component.scss']
})
export class ViewMoreModalComponent implements OnInit {
  @Input() type: string;
  @Input() modalTitle: string;
  @Input() items: any[];
  @Input() text: string;

  searchForm: FormGroup;
  countriesDataSource: MatTableDataSource<ICountry>;

  get organizationReachDesktop(): boolean {
    return window.innerWidth > 700 && this.type === 'organizationReach';
  }

  constructor(private modalController: ModalController, private formBuilder: FormBuilder) {
    this.createSearchForm();
  }

  ngOnInit(): void {
    if (this.type === 'organizationReach') this.countriesDataSource = new MatTableDataSource(this.items);
  }

  dismiss(): void {
    this.modalController.dismiss();
  }

  applyFilter(event: any, dataSource: MatTableDataSource<any>) {
    const filterValue = event.target.value;
    if (filterValue === null) {
      dataSource.filter = '';
    } else {
      dataSource.filter = filterValue;
    }
  }

  async switchToWorldMap(organizationReach: ICountry[]) {
    this.modalController.dismiss().then(async () => {
      (
        await this.modalController.create({
          component: WorldMapModalComponent,
          cssClass: 'world-map-modal',
          componentProps: {
            organizationReach
          }
        })
      ).present();
    });
  }

  private createSearchForm(): void {
    this.searchForm = this.formBuilder.group({
      searchParam: [undefined]
    });
  }
}
