import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ImageModalComponent } from '@app/shared/modals/image-modal/image-modal.component';
import { ViewMoreModalComponent } from '@app/shared/modals/view-more-modal/view-more-modal.component';
import { IOrganization } from '@app/shared/models/organizations.model';
import { IProduct } from '@app/shared/models/product.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit, AfterViewInit {
  @Input() product: IProduct;
  @Input() organization: IOrganization;
  @Input() viewport: string;
  @Input() canEdit: boolean = true;
  @Output() onProductWillEdit = new EventEmitter();

  imagePlaceholder = '../../../../../../../assets/default-fallback-image.svg';
  hasTruncatedDescription: boolean = true;
  readMoreDescription: boolean = false;

  constructor(private modalController: ModalController) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  async descriptionReadMore(text: string, modalTitle: string, type: string): Promise<void> {
    let modal = await this.modalController.create({
      component: ViewMoreModalComponent,
      cssClass: 'view-more-modal',
      componentProps: {
        modalTitle,
        type,
        text
      }
    });

    modal.present();
  }

  async handler(res: boolean) {
    this.hasTruncatedDescription = res;
  }

  async openGallery(uploadedFiles: any): Promise<void> {
    const modal = await this.modalController.create({
      component: ImageModalComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        uploadedFiles
      }
    });
    modal.present();
  }

  async openSalesMarketModal(items: any[], type: string, modalTitle: string): Promise<void> {
    let modal = await this.modalController.create({
      component: ViewMoreModalComponent,
      cssClass: 'view-more-modal',
      componentProps: {
        items,
        type,
        modalTitle
      }
    });
    modal.present();
  }
}
