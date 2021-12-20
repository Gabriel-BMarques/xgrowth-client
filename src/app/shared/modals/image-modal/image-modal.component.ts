import { IonSlides, ModalController } from '@ionic/angular';
import { Component, OnInit, Input, ViewChild, HostListener } from '@angular/core';
import { MediaService } from '@app/services/media.service';

export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37
}
@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss']
})
export class ImageModalComponent implements OnInit {
  @Input('uploadedFiles') uploadedFiles: any;
  @ViewChild(IonSlides) slides: IonSlides;

  active: number = 0;
  sliderOpts = {
    zoom: true
  };
  imageFormats: string[] = ['jpeg', 'jpg', 'tiff', 'gif', 'bmp', 'png', 'ppm', 'hdr', 'heif', 'bat', 'svg', 'exif'];

  constructor(private ModalController: ModalController, private mediaService: MediaService) {}

  ngOnInit() {}

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === KEY_CODE.RIGHT_ARROW) {
      this.next();
    }

    if (event.keyCode === KEY_CODE.LEFT_ARROW) {
      this.prev();
    }
  }

  isImage(file: any): boolean {
    if (file.isImage) return true;
    if (file.url) {
      return this.imageFormats.includes(file.Type);
    }
  }

  get isLoadingVideos(): boolean {
    return this.mediaService.isLoading;
  }

  ionViewDidEnter() {
    this.slides.update();
  }

  async onSlideChange() {
    this.active = await this.slides.getActiveIndex();
  }

  async zoom(zoomIn: boolean) {
    this.slides.update();
    const slider = await this.slides.getSwiper();
    const zoom = slider.zoom;
    zoomIn ? zoom.in() : zoom.out();
  }

  close() {
    this.ModalController.dismiss();
  }

  prev() {
    this.slides.update();
    this.slides.slidePrev();
  }

  next() {
    this.slides.update();
    this.slides.slideNext();
  }
}
