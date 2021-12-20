import { Component, Input, OnInit } from '@angular/core';
import { IItem } from '@app/shared/models/item.model';
import { IUser } from '../../models/user.model';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ModalPageComponent } from '../../modals/modal/modal.component';
import { PanelService } from '@app/services/panel.service';
import { DataService } from '@app/services/data.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() Item: IItem;
  @Input() Type: string;
  currentModal: any;
  addedItems: IItem[];

  constructor(
    public modalController: ModalController,
    public router: Router,
    public panelService: PanelService,
    public dataService: DataService
  ) {}

  ngOnInit() {}

  fallbackImage() {
    if (this.Item.UploadedFiles) {
      this.Item.UploadedFiles[0].url = 'https://picsum.photos/id/122/130/160';
    }
  }

  add(entity: any) {
    this.panelService.addedItems(entity);
  }

  itemClick(id?: string, name?: string, whatever?: IUser) {
    if (this.Type === 'users') {
      this.openModal(id, 'user');
    }
    if (this.Type === 'organizations') {
      this.openModal(id, 'organization');
    }
    if (this.Type === 'companies') {
      this.openModal(id, 'company');
    }
    if (this.Type === 'collections') {
      this.router.navigate(['/collections/' + id + '/collection-details'], { replaceUrl: true });
    }
  }

  async imageClick(id?: string) {
    if (this.Type === 'posts') {
      this.router.navigate(['/post/details/', id], { replaceUrl: true });
    }
    if (this.Type === 'suppliers') {
      await this.dataService
        .find('/company-profile', id)
        .toPromise()
        .then(res => {
          const {
            organization: { _id: organizationId }
          } = res.body;
          this.router.navigate(['/organization', organizationId, '/overview'], { replaceUrl: true });
        });
    }
  }

  getResizedUrl(file: any) {
    if (file) {
      const container = this.getContainerName(file.url);
      if (container === 'cblx-img') {
        if (file.Type === 'gif') {
          return file.url;
        } else {
          return `${file.url}-SM`;
        }
      } else if (container === 'app-images') {
        const blobName = this.getBlobName(file.url);
        return `https://weleverimages.blob.core.windows.net/${blobName}`;
      }
    }
  }

  getBlobName(url: string) {
    const blobName = url.split('https://weleverimages.blob.core.windows.net/').pop();
    const extension = url.split('.').pop();
    const fileName = blobName.split('.', 1);
    const newBlobName = `${fileName}-SM.${extension}`;
    return newBlobName;
  }

  getContainerName(url: string) {
    return url
      .toString()
      .split('https://weleverimages.blob.core.windows.net/')
      .pop()
      .split('/')[0];
  }

  getThumbnail(url: string) {
    const containerName = this.getContainerName(url);

    switch (containerName) {
      case 'cblx-img':
        const urlAux = url.split('/f')[0];
        return urlAux + '-output/f_200_000001.jpg';
      case 'app-images':
        const blobName = url
          .split('https://weleverimages.blob.core.windows.net/')
          .pop()
          .split('.')[0];
        return `https://weleverimages.blob.core.windows.net/${blobName}-thumbnail.png`;
      default:
        break;
    }
  }

  isVideo(type: string) {
    const videoFormats = ['mp4', 'wmv', 'avi', 'mov'];
    if (videoFormats.includes(type)) {
      return true;
    } else {
      return false;
    }
  }

  titleClick(id?: string) {
    if (this.Type === 'posts') {
      this.router.navigate(['/post/', id], { replaceUrl: true });
    }
  }

  subtitleClick(id?: string) {
    if (this.Type === 'posts') {
      this.dataService.find('/post', id).subscribe(async post => {
        const companyId = post.body.SupplierId;
        await this.dataService
          .find('/company-profile', companyId)
          .toPromise()
          .then(res => {
            const {
              organization: { _id: organizationId }
            } = res.body;
            this.router.navigate(['/organization', organizationId, '/overview'], { replaceUrl: true });
          });
      });
    }
  }

  async edit(id?: any, type?: any) {
    switch (type) {
      case 'categories':
        const modal = this.modalController.create({
          component: ModalPageComponent,
          componentProps: {
            id,
            type
          }
        });

        (await modal).present();
        this.currentModal = modal;
        break;
    }
  }

  async delete(item?: any, type?: any) {
    switch (type) {
      case 'categories':
        const modal = this.modalController.create({
          component: ModalPageComponent,
          componentProps: {
            Type: type,
            id: item.id,
            Mode: 'delete'
          }
        });

        (await modal).present();
        this.currentModal = modal;
        break;
    }
  }

  async openModal(id?: string, type?: string) {
    const modal = this.modalController.create({
      component: ModalPageComponent,
      componentProps: {
        id,
        type,
        firstName: 'Douglas',
        lastName: 'Adams',
        middleInitial: 'N'
      }
    });

    (await modal).present();
    this.currentModal = modal;
  }

  dismissModal() {
    if (this.currentModal) {
      this.currentModal.dismiss().then(() => {
        this.currentModal = null;
      });
    }
  }
}
