import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { MockService } from '@app/services/mock.service';
import { HeaderService } from '@app/services/header.service';
import { IPost, Post } from '@app/shared/models/post.model';
import { ICollectionPost } from '@app/shared/models/collection-post.model';
import { ActivatedRoute, Router } from '@angular/router';
import { PostAddWizardService } from '@app/services/post-add-wizard.service';
import { ICategory } from '@app/shared/models/category.model';
import { DataService } from '@app/services/data.service';
import { IonSlides, ModalController } from '@ionic/angular';
import { Image, GalleryService, Description, DescriptionStrategy } from '@ks89/angular-modal-gallery';
import { MediaService } from '@app/services/media.service';
import { ImageModalComponent } from '../../../../shared/modals/image-modal/image-modal.component';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { NotificationService } from '@app/services/notification.service';
import { NavigationService } from '@app/services/navigation.service';
import { UserInfoService } from '@app/services/user-info.service';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PostPreviewComponent implements IAlertControtllerGuard {
  @ViewChild('slides', { static: false }) slides: IonSlides;
  @ViewChild('slidesMobile', { static: false }) slidesMobile: IonSlides;
  header: string;
  display = false;
  viewAll = false;
  detailsImages: Image[] = [];
  isLoading = false;
  limit = 100;
  limitTag = 16;
  active: number = 0;
  activeMobile: number = 0;
  truncating = true;
  post: IPost;
  categories: ICategory[] = [];
  collectionPosts: ICollectionPost[];
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };
  skeletonLoading = true;
  customFullDescription: Description = {
    strategy: DescriptionStrategy.ALWAYS_HIDDEN,
    style: {
      textColor: 'white',
      marginTop: '1rem',
      position: 'relative'
    }
  };
  currentCompany: any;
  pins = 0;
  galleryId: number;
  company: any;

  constructor(
    private headerService: HeaderService,
    private mockService: MockService,
    private router: Router,
    private route: ActivatedRoute,
    private wizard: PostAddWizardService,
    private dataService: DataService,
    private galleryService: GalleryService,
    private mediaService: MediaService,
    private ModalController: ModalController,
    private navigationService: NavigationService,
    private userInfoService: UserInfoService
  ) {
    this.verifyHeaderLang();
    this.headerService.setHeader(this.header);
  }

  async ionViewWillEnter() {
    this.generateGalleryId();
    await this.checkWizardReset();
    this.skeletonLoading = true;
    this.post = new Post();
    this.post.Title = this.wizard.step1Form.controls.name.value;
    this.post.Description = this.wizard.step1Form.controls.description.value;
    this.post.UploadedFiles = this.wizard.step1Form.controls.uploadedFiles.value;
    this.post.Categories = this.wizard.step2Form.controls.categories.value;
    this.company = this.wizard.currentCompany;
    this.loadPostMedia(this.post);
    this.loadSectionImages(this.post);
    this.skeletonLoading = false;
  }

  async resetPostCreation() {
    const postId = this.route.snapshot.params.id;
    if (!postId) this.router.navigate(['/post/add'], { replaceUrl: true });
    else this.wizard.postId = postId;
    await this.wizard.loadWizard();
  }

  async checkWizardReset() {
    if (this.wizard.isReseted) await this.resetPostCreation();
  }

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Post';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Post';
    }
  }

  generateGalleryId() {
    this.galleryId = Math.floor(Math.random() * 10000);
  }

  getPlayerId(index: string, type: string) {
    return `p${index}-${type}`;
  }
  viewAllTags() {
    this.viewAll = !this.viewAll;
  }

  ionViewDidEnter() {
    this.headerService.setHeader(this.header);
    this.isLoading = true;
  }

  async publish() {
    await this.wizard.submit();

    const organizationId = this.wizard.organizationId ? this.wizard.organizationId : '';
    this.router.navigate(['/organization', organizationId, 'overview'], { replaceUrl: true });
  }

  fallbackImage(i: number) {}

  getThumbnailImage(url: string) {
    const image = 'https://weleverimages.blob.core.windows.net/app-images/' + url;
    return image;
  }

  async onSlideChange() {
    this.active = await this.slides.getActiveIndex();
    this.activeMobile = await this.slidesMobile.getActiveIndex();
  }

  back() {
    console.log(this.wizard.isEditing);
    if (this.wizard.isEditing) {
      this.router.navigate(['/post/add/edit/terms-and-conditions', this.wizard.entity._id]);
    } else {
      this.router.navigate(['/post/add/terms-and-conditions']);
    }
  }

  openModalViaService(id: number | undefined, index: number) {
    this.galleryService.openGallery(id, index);
  }

  loadPostMedia(entity: any) {
    this.mediaService.loadMedia(entity);
  }

  loadGalleryImages() {
    this.post.UploadedFiles.map((file: any, key: number = 0) => {
      if (file.isImage) {
        this.detailsImages.push(new Image(key, { img: file.url, description: `Image ${key + 1}` }));
      }
    });
  }

  loadSectionImages(post: IPost) {
    const videoFormats = ['mp4', 'wmv', 'avi', 'mov'];
    if (post.UploadedFiles.length > 0) {
      this.mediaService.orderImages(post);
      post.UploadedFiles.map((file: any) => {
        if (videoFormats.includes(file.Type)) {
          file.isVideo = true;
          file.isImage = false;
        } else {
          file.isVideo = false;
          file.isImage = true;
        }
      });
    }
  }

  async openGallery(uploadedFiles: any) {
    const modal = await this.ModalController.create({
      component: ImageModalComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        uploadedFiles: uploadedFiles
      }
    });
    modal.present();
  }
  canDeactivate() {
    return this.navigationService.generateAlert(
      'Discard Post?',
      'If you leave the post creation now, you will lose the edited information',
      'Discard',
      'Keep'
    );
  }

  ngOnDestroy() {
    this.mediaService.destroyPlayer();
  }

  next() {
    this.slides.slideNext();
  }

  prev() {
    this.slides.slidePrev();
  }
}
