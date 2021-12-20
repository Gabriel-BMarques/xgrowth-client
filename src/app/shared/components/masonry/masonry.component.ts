import { ModalPostComponent } from '../../modals/modal-post/modal-post.component';
import {
  Component,
  Input,
  EventEmitter,
  Output,
  ViewChild,
  AfterViewInit,
  AfterViewChecked,
  ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { PopoverController, ModalController } from '@ionic/angular';
import { IPost } from '../../models/post.model';
import { MasonryPopOverComponent } from '../../popovers/masonry-pop-over/masonry-pop-over.component';
import { NgxMasonryComponent } from 'ngx-masonry';
import { MediaService } from '@app/services/media.service';
import { Observable } from 'rxjs';
import { IUserAction } from '@app/shared/models/userAction.model';
import { CredentialsService } from '@app/core';
@Component({
  selector: 'app-masonry',
  templateUrl: './masonry.component.html',
  styleUrls: ['./masonry.component.scss']
})
export class MasonryComponent implements AfterViewInit, AfterViewChecked {
  @Input() posts: IPost[];
  @Input() isEditing: boolean;
  @Input() type: string;
  @Input() updateMasonryLayout: boolean;
  @Input() class: string = 'start-six';
  @Input() onScrollEvent: Observable<any>;
  @Input() onScrollStop: Observable<any>;
  @Input() onFirstLoad: EventEmitter<any>;
  @Output() newModalEvent = new EventEmitter();
  @Output() onPostDelete: EventEmitter<object> = new EventEmitter();
  @Output() onPostEnter: EventEmitter<boolean> = new EventEmitter();
  @ViewChild(NgxMasonryComponent) masonry: NgxMasonryComponent;

  masonryOptions = {
    percentPosition: true,
    animations: {},
    initLayout: true
  };
  document: any = document;
  currentModal: any;
  recentLoadedPosts: IPost[];
  postImpressions: IUserAction[] = [];

  constructor(
    public router: Router,
    private dataService: DataService,
    private popOverController: PopoverController,
    public modalController: ModalController,
    private mediaService: MediaService,
    private cdRef: ChangeDetectorRef,
    private credentialsService: CredentialsService
  ) {}

  ngAfterViewInit(): void {
    this.posts?.map(p => this.generateImpression(p));
    this.onScrollEvent?.subscribe(() => {
      this.posts?.map(p => this.generateImpression(p));
    });
    this.onScrollStop?.subscribe(async () => {
      await this.dataService.createMany('/users/user-action', this.postImpressions).toPromise();
      this.postImpressions = [];
    });
  }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  generateImpression(post: IPost): void {
    let postCardRect = document.getElementById(post._id).getBoundingClientRect();
    let isVisible =
      postCardRect.top >= 0 &&
      postCardRect.left >= 0 &&
      postCardRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      postCardRect.right <= (window.innerWidth || document.documentElement.clientWidth);

    let previousVisibility = post.isVisible || false;
    post.isVisible = isVisible;

    let addImpressionCondition =
      isVisible &&
      !previousVisibility &&
      !post.BriefId &&
      !this.postImpressions.some(pi => pi.PostId === post._id) &&
      !this.credentialsService.credentials.impersonation;

    if (addImpressionCondition) this.addPostImpression(post._id);
  }

  reloadMasonry() {
    if (this.masonry !== undefined) {
      this.masonry.reloadItems();
      this.masonry.layout();
    }
  }

  async postClick(id?: string): Promise<void> {
    this.newModalEvent.emit();
    this.onPostEnter.emit(true);
    const modal = await this.modalController.create({
      component: ModalPostComponent,
      cssClass: 'modal-post-page',
      componentProps: {
        postId: id,
        type: 'post',
        actionEvent: this.onPostDelete,
        dismiss: () => modal.dismiss()
      }
    });
    modal.present();
    modal.onDidDismiss().then(() => {
      this.mediaService.destroyPlayer();
      this.onPostEnter.emit(false);
    });
    this.currentModal = modal;
  }

  async subtitleClick(id?: string): Promise<void> {
    const { _id } = (await this.dataService.find('/organization', id).toPromise()).body;
    this.router.navigate([`/organization/${_id}/overview`], { replaceUrl: true });
  }

  async presentPopover(event: any, post: IPost): Promise<void> {
    event.preventDefault();
    const postPopover: HTMLIonPopoverElement = await this.popOverController.create({
      component: MasonryPopOverComponent,
      componentProps: { post, dismiss: () => postPopover.dismiss() },
      cssClass: 'masonry-popover',
      showBackdrop: false,
      translucent: true,
      event
    });
    await postPopover.present();
  }

  private async addPostImpression(postId: string) {
    let impression: IUserAction = {
      PostId: postId,
      Type: 5
    };
    this.postImpressions.push(impression);
  }
}
