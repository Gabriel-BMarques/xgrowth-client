import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IOrganization } from '@app/shared/models/organizations.model';
import { IProduct } from '@app/shared/models/product.model';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-product-edit-menu',
  templateUrl: './product-edit-menu.component.html',
  styleUrls: ['./product-edit-menu.component.scss']
})
export class ProductEditMenuComponent implements OnInit {
  @Input() viewport: string;
  @Input() organization: IOrganization;
  @Output() onMenuDismiss = new EventEmitter();
  @ViewChild('productEditForm') productEditForm: any;
  product: IProduct;

  constructor(private menuController: MenuController) {}

  ngOnInit(): void {}

  reset(): void {
    this.productEditForm.reset();
    this.product = undefined;
  }

  public openEditMenu() {
    if (!this.menuController.isEnabled('first')) this.menuController.enable(true, 'first');
    this.menuController.open('first');
  }

  public disableMenu() {
    this.menuController.close('first');
    this.onMenuDismiss.emit();
  }
}
