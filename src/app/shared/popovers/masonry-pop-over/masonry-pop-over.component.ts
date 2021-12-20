import { UserInfoService } from '@app/services/user-info.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { AddCollectionComponent } from '@app/pages/collections/my-collections/add-collection/add-collection.component';
import { CollectionModalComponent } from '@app/pages/post/collection-modal/collection-modal.component';
import { DataService } from '@app/services/data.service';
import { ModalController, PopoverController } from '@ionic/angular';
import { ICollection } from '../../models/collections.model';
import { IPost } from '../../models/post.model';
import { IUser } from '../../models/user.model';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-masonry-pop-over',
  templateUrl: './masonry-pop-over.component.html',
  styleUrls: ['./masonry-pop-over.component.scss']
})
export class MasonryPopOverComponent implements OnInit, OnDestroy {
  @Input('post') post: IPost;
  @Input('dismiss') dismiss: () => void;
  collections: ICollection[];
  user: IUser;
  briefAdmins: any;
  isLoading = true;
  $routerEvents: Subscription;

  constructor(
    private router: Router,
    private ModalController: ModalController,
    private PopoverController: PopoverController,
    private dataService: DataService,
    private userInfoService: UserInfoService
  ) {
    this.$routerEvents = this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => this.dismiss());
  }

  async ngOnInit(): Promise<void> {
    this.loadUser();
  }

  ngOnDestroy(): void {
    this.$routerEvents.unsubscribe();
  }

  loadUser() {
    this.user = this.userInfoService.storedUserInfo;
    this.isLoading = false;
  }

  openPostInNewWindow(): void {
    // width 10000px will make the window open at the screen width, 100% and 100vw doesn't worked
    this.dismiss();
    window.open(`/#/post/details/${this.post._id}`, 'name', 'fullscreen=yes,width=10000');
  }

  sharePost(): void {
    this.dismiss();
    this.router.navigate(['/post/share', this.post._id], { replaceUrl: true });
  }

  async savePost(): Promise<void> {
    this.dismiss();

    await this.dataService
      .list('/collections', { UserId: this.user.id })
      .toPromise()
      .then(collections => {
        this.collections = collections.body;
      });

    const modal: HTMLIonModalElement = await this.ModalController.create({
      component: CollectionModalComponent,
      componentProps: {
        collections: this.collections,
        postId: this.post._id
      }
    });

    await modal.present();

    await modal.onDidDismiss().then(async data => {
      if (data.data === 'addCollection') {
        const popover: HTMLIonPopoverElement = await this.PopoverController.create({
          component: AddCollectionComponent,
          cssClass: 'add-collection',
          componentProps: {
            postId: this.post._id
          }
        });

        await popover.present();

        await popover.onDidDismiss().then(mode => {
          if (mode.data === 'create') {
            this.router.navigate(['/collections/my-collections'], { replaceUrl: true });
          }
        });
      }
    });
  }

  editPost(): void {
    this.dismiss();
    this.router.navigate(['/post/add/edit', this.post._id], { replaceUrl: true });
  }

  get canEdit(): boolean {
    if (this.post.CreatedBy) {
      const createdBy = this.post.CreatedBy._id || this.post.CreatedBy;
      return createdBy === this.user.id || this.user.role === 'admin';
    }
    return false;
  }

  get isCreator(): boolean {
    if (this.post.CreatedBy) {
      const createdBy = this.post.CreatedBy._id || this.post.CreatedBy;
      return createdBy === this.user._id;
    }
    return false;
  }
}
