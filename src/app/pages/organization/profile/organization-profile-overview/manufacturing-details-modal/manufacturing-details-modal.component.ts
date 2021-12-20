import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { IPlant } from '@app/shared/models/plant.model';
import { isNil } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { pluck, tap } from 'rxjs/operators';

@Component({
  selector: 'app-manufacturing-details-modal',
  templateUrl: './manufacturing-details-modal.component.html',
  styleUrls: ['./manufacturing-details-modal.component.scss']
})
export class ManufacturingDetailsModalComponent implements OnInit {
  @Input() organizationId: string;
  _plantsSubject$ = new BehaviorSubject<IPlant[]>([]);
  plants$ = this._plantsSubject$.asObservable();

  infoColumns = [
    {
      translate: 'myCompany.profile.manufacturingDetailsInfo.plant&Location',
      class: 'col-3 pl-0 pr-0'
    },
    {
      translate: 'myCompany.profile.manufacturingDetailsInfo.contact',
      class: 'col-3 pl-0 pr-0'
    },
    {
      translate: 'myCompany.profile.manufacturingDetailsInfo.productionLine',
      class: 'col-2 pl-0 pr-0'
    },
    {
      translate: 'myCompany.profile.manufacturingDetailsInfo.products',
      class: 'col-4 pr-0'
    }
  ];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadData();
  }

  switchProductsTruncation(line: any): void {
    line.productsTruncated = !line.productsTruncated;
  }

  maxProducts(line: any, col: number): number {
    if (line.productsTruncated) {
      if (col === 1) return 5;
      if (col === 2) return 9;
    } else {
      if (col === 1) return Math.ceil(line.products.length / 2);
      if (col === 2) return line.products.length;
    }
  }

  private loadData() {
    this.plants$ = this.dataService.list('/plant/full-structure', { organization: this.organizationId }).pipe(
      pluck('body'),
      tap(plants => this._plantsSubject$.next(plants))
    );
  }
}
