import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MockService } from '@app/services/mock.service';
import { AddCollectionComponent } from './add-collection/add-collection.component';
import { ModalController, PopoverController } from '@ionic/angular';
import { DataService } from '@app/services/data.service';
import { ICollectionPost } from '@app/shared/models/collection-post.model';
import { FilesService } from '@app/services/files.service';
import { MigrationService } from '@app/services/migration.service';
import { Router } from '@angular/router';
import { MediaService } from '@app/services/media.service';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-my-collections',
  templateUrl: './my-collections.component.html',
  styleUrls: ['./my-collections.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MyCollectionsComponent implements OnInit {
  currentModal: any;
  value: any;
  collectionPosts: ICollectionPost[];
  isLoading = true;
  images: any[] = [];
  currentUser: any;
  collections: any[] = [];

  constructor(
    public mockService: MockService,
    private dataService: DataService,
    private popoverController: PopoverController,
    private router: Router,
    private mediaService: MediaService,
    private navigationService: NavigationService
  ) {}

  async ngOnInit() {
    await this.refreshData();
    this.reverse();
    this.isLoading = false;
  }

  async ionViewDidEnter() {
    this.navigationService.getRoute(window.location.hash);
  }

  async refreshData() {
    await this.dataService
      .list('/collections')
      .toPromise()
      .then(collections => {
        this.collections = collections.body;
      });
  }

  getCollectionImages(collection: any) {
    const videoFormats = ['mp4', 'wmv', 'avi', 'mov', 'mkv'];
    const posts = collection.postsIds;
    const images = posts.map((post: any) => {
      this.mediaService.orderImages(post);
      if (post.UploadedFiles[0]) {
        if (videoFormats.includes(post.UploadedFiles[0].Type)) {
          post.UploadedFiles[0].isVideo = true;
          post.UploadedFiles[0].isImage = false;
        } else {
          post.UploadedFiles[0].isVideo = false;
          post.UploadedFiles[0].isImage = true;
        }
      }
      return post.UploadedFiles[0];
    });
    return images;
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

  itemClick(id: string) {
    this.router.navigate(['/collections', id, 'collection-details'], { replaceUrl: true });
  }

  reverse() {
    this.collections.reverse();
  }

  async addCollection() {
    const modal = await this.popoverController.create({
      component: AddCollectionComponent,
      cssClass: 'add-collection'
    });

    modal.present();
    this.currentModal = modal;

    modal.onDidDismiss().then(() => {
      this.refreshData();
    });
  }

  dismissModal() {
    if (this.currentModal) {
      this.currentModal.dismiss().then(() => {
        this.currentModal = null;
      });
    }
  }
}
