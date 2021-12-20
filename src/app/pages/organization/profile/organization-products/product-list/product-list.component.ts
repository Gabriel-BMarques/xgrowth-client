import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { ILine } from '@app/shared/models/line.model';
import { IOrganization } from '@app/shared/models/organizations.model';
import { IProduct } from '@app/shared/models/product.model';
import { BehaviorSubject } from 'rxjs';
import { pluck, tap } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, AfterViewInit {
  @Input() products: IProduct[];
  @Input() viewport: string;
  @Input() class: string;
  @Input() organization: IOrganization;
  @Input() canEdit: boolean;
  @Input() mode: string = 'grid';
  @Output() onProductEdit = new EventEmitter();
  @ViewChild('editProductMenu') editProductMenu: any;

  private _lineSubject$ = new BehaviorSubject<ILine[]>([]);

  lines$ = this._lineSubject$.asObservable();

  constructor(private dataService: DataService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.load(this.organization._id);
  }

  onProductEdition(mode: string): void {
    console.log(mode);
    switch (mode) {
      case 'grid':
        this.onProductEdit.emit();
        break;
      case 'accordion':
        this.lines$.subscribe();
        break;
      default:
        break;
    }
  }

  onPanelOpen(id: string): void {
    let indicator = document.getElementById(id);
    indicator.style.transform = 'rotate(180deg)';
  }

  onPanelClose(id: string): void {
    let indicator = document.getElementById(id);
    indicator.style.transform = 'rotate(360deg)';
  }

  async presentProductEditModal(product: IProduct): Promise<void> {
    this.editProductMenu.product = product;
    this.editProductMenu.openEditMenu();
  }

  private load(organization: string) {
    this.lines$ = this.dataService.list('/line/products', { organization }).pipe(
      pluck('body'),
      tap(lines => this._lineSubject$.next(lines))
    );
  }
}
