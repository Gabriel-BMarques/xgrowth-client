import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MockService } from '@app/services/mock.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { DataService } from '@app/services/data.service';
import { ICollection } from '@app/shared/models/collections.model';
import { IPost } from '@app/shared/models/post.model';
import { IUploadedFile } from '@app/shared/models/uploadedFile.model';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { IItem } from '@app/shared/models/item.model';
import { ICollectionPost } from '@app/shared/models/collection-post.model';
import { PopoverController } from '@ionic/angular';
import { DeleteCollectionComponent } from './delete-collection/delete-collection.component';
import { FilesService } from '@app/services/files.service';
import { HeaderService } from '@app/services/header.service';
import { NavigationService } from '@app/services/navigation.service';
import { MediaService } from '@app/services/media.service';

@Component({
  selector: 'app-collection-details',
  templateUrl: './collection-details.component.html',
  styleUrls: ['./collection-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CollectionDetailsComponent implements OnInit {
  header: string;
  collectionName: string;
  isEditing = false;
  collectionForm: FormGroup;
  collection: ICollection;
  deleteArray: any[];
  footer: boolean;
  collectionId: string;
  companies: ICompanyProfile[];
  collectionPosts: ICollectionPost[];
  selectedItems: IItem[] = [];
  allSelected: boolean;
  isLoading = true;
  posts: IPost[] = [];

  constructor(
    public mockService: MockService,
    public router: Router,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    private dataService: DataService,
    public popover: PopoverController,
    private filesService: FilesService,
    private headerService: HeaderService,
    private navigationService: NavigationService,
    private mediaService: MediaService
  ) {
    this.createForm();
  }

  async ngOnInit() {
    this.collectionId = this.route.snapshot.params.id;
    await this.dataService
      .listAll('/company-profile')
      .toPromise()
      .then(companies => {
        this.companies = companies.body;
      });
    await this.refreshPosts();
    this.isLoading = false;
    console.log(this.posts);
  }

  async ionViewWillEnter() {
    this.headerService.setHeader(this.header);
    this.navigationService.getRoute(window.location.hash);
  }

  async deleteItems() {
    this.deleteArray = this.posts.filter((item: any) => {
      return item.selected === true;
    });
    this.deleteArray.map(item => {
      this.posts.splice(this.posts.indexOf(item), 1);
    });
    this.dataService
      .find('/collections', this.collectionId)
      .toPromise()
      .then(collection => {
        const postsToDelete = this.deleteArray.map(item => {
          return item.id;
        });
        postsToDelete.map(id => {
          const index = collection.body.postsIds.indexOf(id);
          collection.body.postsIds.splice(index, 1);
        });
        this.dataService
          .update('/collections', collection.body)
          .toPromise()
          .then(() => {});
      });
  }

  selectAll() {
    this.allSelected = true;
    this.posts.map((val: any) => {
      val.selected = true;
      this.selectedItems.push(val);
    });
  }

  deselectAll() {
    this.allSelected = false;
    this.posts.map((val: any) => {
      val.selected = false;
      this.selectedItems = [];
    });
  }

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Post';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Post';
    }
  }

  async refreshPosts() {
    await this.dataService
      .find('/collections', this.collectionId)
      .toPromise()
      .then(collection => {
        this.posts = collection.body.postsIds;
        console.log(collection.body);
        this.collection = collection.body;
      });
    this.collectionForm.controls.collectionName.setValue(this.collection.Name);
  }

  public editMode() {
    this.isEditing = true;
  }

  public formatUrls(post: IPost) {
    post.UploadedFiles.map(fileUrl => {
      fileUrl.url = this.getThumbnailImage(fileUrl.url);
    });
  }

  public getThumbnailImage(url: string) {
    const image = 'https://weleverimages.blob.core.windows.net/app-images/' + url;
    return image;
  }

  public saveEditions() {
    if (!this.collectionForm.controls.collectionName.invalid) {
      this.isEditing = false;
      this.updateData();
    }
  }

  public deleteEditions() {
    this.isEditing = false;
    this.posts.map((val: any) => {
      if (val.selected === true) {
        val.selected = false;
      }
    });
    this.collectionForm.controls.collectionName.setValue(this.collection.Name);
  }

  async deleteCollection() {
    const modal = await this.popover.create({
      component: DeleteCollectionComponent,
      componentProps: {
        collection: this.collection
      },
      cssClass: 'delete-collection'
    });

    modal.onDidDismiss().then(() => {
      this.router.navigate(['/collections/my-collections'], { replaceUrl: true });
    });
    modal.present();
  }

  private updateData() {
    this.collection.Name = this.collectionForm.controls.collectionName.value;
    this.dataService
      .update('/collections', this.collection)
      .toPromise()
      .then(() => {});
  }

  private createForm() {
    this.collectionForm = this.formBuilder.group({
      collectionName: ['', [Validators.required]]
    });
  }
}
