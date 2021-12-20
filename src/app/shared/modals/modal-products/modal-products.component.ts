import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-products',
  templateUrl: './modal-products.component.html',
  styleUrls: ['./modal-products.component.scss']
})
export class ModalProductsComponent implements OnInit {
  @Input() products: any[];

  constructor(private modalController: ModalController) {}

  ngOnInit(): void {}

  back() {
    this.modalController.dismiss();
  }
}
