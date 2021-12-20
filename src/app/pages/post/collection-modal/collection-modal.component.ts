import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '@app/services/data.service';
import { FilesService } from '@app/services/files.service';
import { ICollection } from '@app/shared/models/collections.model';
import { IonContent, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-collection-modal',
  templateUrl: './collection-modal.component.html',
  styleUrls: ['./collection-modal.component.scss']
})
export class CollectionModalComponent implements OnInit, OnDestroy {
  @Input() collections: any[];
  @Input() postId: string;
  collectionsData: MatTableDataSource<ICollection>;
  currentModal: any;
  isLoading = true;
  post: any;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(IonContent, { static: true }) contentArea: IonContent;

  constructor(
    private dataService: DataService,
    private modalController: ModalController,
    private filesService: FilesService
  ) {}

  ngOnDestroy() {}

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.collectionsData = new MatTableDataSource(this.collections);
    this.collectionsData.paginator = this.paginator;
    this.collectionsData.sort = this.sort;
    this.collections.map(collection => {
      collection.numberOfPosts = collection.postsIds.length;
    });
    this.isLoading = false;
  }

  cancel() {
    this.dismiss();
  }

  applyFilter(filterValue: string) {
    if (filterValue === null) {
      this.collectionsData.filter = '';
    } else {
      this.collectionsData.filter = filterValue.trim().toLowerCase();
    }

    if (this.collectionsData.paginator) {
      this.collectionsData.paginator.firstPage();
    }
  }

  async addCollectionPost(id: string) {
    const collection = this.collections.find(entity => {
      return entity._id === id;
    });
    if (!collection.postsIds) {
      collection.postsIds = [];
    }
    if (!this.isAdded(collection._id)) {
      collection.postsIds.push(this.postId);
      try {
        await this.dataService.update('/collections', collection).toPromise();
        this.modalController.dismiss();
      } catch (e) {
        this.modalController.dismiss();
      }
    }
  }

  getCollectionImages(collection: any) {
    let image: any;
    const posts = collection.postsIds;
    image = posts[0].UploadedFiles[0];
    return image;
  }

  isAdded(collectionId: string) {
    const collection = this.collections.find(entity => {
      return entity._id === collectionId;
    });
    const found = collection.postsIds
      .map((post: any) => post._id)
      .some((postId: string) => {
        return postId === this.postId;
      });
    if (found) {
      return true;
    } else {
      return false;
    }
  }

  dismiss(mode?: string) {
    this.modalController.dismiss(mode);
  }
}
