import { Injectable } from '@angular/core';

declare let Plyr: any;

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private _isProcessing: boolean;
  private _isLoading: boolean = false;
  playerDesktop: any;
  playerMobile: any;

  get videoFormats(): string[] {
    return ['mp4', 'wmv', 'avi', 'mov'];
  }

  constructor() {}

  orderImages(entity?: any) {
    entity.UploadedFiles.sort((a: any, b: any) => {
      if (a.Order > b.Order) {
        return 1;
      }
      if (a.Order < b.Order) {
        return -1;
      }
      return 0;
    });
  }

  getVideoSource(url: string, fileOption: string) {
    const blobNameWithExtension = url.split('https://weleverimages.blob.core.windows.net/app-images/').pop();
    const blobExtension = blobNameWithExtension.split('.').pop();
    const blobName = blobNameWithExtension.split('.')[0];
    if (blobExtension && blobExtension !== '' && fileOption !== 'thumbnail.png') {
      return `https://weleverimages.blob.core.windows.net/app-images/${blobName}-${fileOption}.${blobExtension}`;
    } else {
      return `https://weleverimages.blob.core.windows.net/app-images/${blobName}-${fileOption}`;
    }
  }

  initPlayer(videoFiles: any, thumbnail: any, id: string) {
    const plyrDesk = document.querySelector(`#p${id}-desktop`);
    const plyrMob = document.querySelector(`#p${id}-mobile`);
    this.playerDesktop = new Plyr(plyrDesk);
    this.playerMobile = new Plyr(plyrMob);
    this.playerDesktop.controls = [
      'play-large',
      'play',
      'progress',
      'current-time',
      'mute',
      'volume',
      'settings',
      'fullscreen'
    ];
    this.playerDesktop.settings = ['quality', 'loop'];
    this.playerMobile.controls = [
      'play-large',
      'play',
      'progress',
      'current-time',
      'mute',
      'volume',
      'settings',
      'fullscreen'
    ];
    this.playerMobile.settings = ['quality', 'loop'];

    this.playerDesktop.source = {
      type: 'video',
      title: '',
      sources: videoFiles,
      poster: thumbnail
    };
    this.playerMobile.source = {
      type: 'video',
      title: '',
      sources: videoFiles,
      poster: thumbnail
    };
  }

  destroyPlayer() {
    if (this.playerDesktop) {
      this.playerDesktop.pause();
    }
    if (this.playerMobile) {
      this.playerMobile.pause();
    }
  }

  getMediaTypes(entity: any) {
    entity.UploadedFiles.map((file: any) => {
      if (this.videoFormats.includes(file.Type)) {
        file.isVideo = true;
        file.isImage = false;
      } else {
        file.isVideo = false;
        file.isImage = true;
      }
    });
  }

  async loadMedia(entity: any) {
    const timeOut = 1000;

    if (entity.cblxEntity) this.orderImages(entity);

    entity.UploadedFiles.filter((uf: any) => uf.isVideo).forEach((uf: any) => {
      setTimeout(() => {
        this.initPlayer(uf.VideoSources, uf.Thumbnail, entity.UploadedFiles.indexOf(uf));
      }, timeOut);
    });
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  set isLoading(value: boolean) {
    this._isLoading = value;
  }

  get isProcessing(): boolean {
    return this._isProcessing;
  }

  set isProcessing(value: boolean) {
    this._isProcessing = value;
  }
}
