import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  currentHeader = new BehaviorSubject('Title');
  pages = [
    {
      title: 'Feed',
      path: ['/home'],
      img: '/assets/icon/feed-icon.svg',
      titleClass: 'segment-title',
      id: 'header-feed'
    },
    {
      title: 'Interests',
      path: ['/interests'],
      img: '/assets/icon/interests-icon.svg',
      titleClass: 'segment-title',
      id: 'header-interests'
    },
    {
      title: 'Briefs',
      path: ['/briefs'],
      img: '/assets/icon/briefs-icon.svg',
      titleClass: 'segment-title',
      id: 'header-briefs'
    },
    {
      title: 'Collections',
      path: ['/collections/my-collections'],
      img: '/assets/icon/collections-icon.svg',
      titleClass: 'segment-title',
      id: 'header-collections'
    },
    {
      title: 'Solvers',
      path: ['/solvers'],
      img: '/assets/icon/solvers-icon.svg',
      titleClass: 'segment-title',
      id: 'header-solvers'
    }
  ];

  constructor() {}

  setHeader(header: string) {
    this.currentHeader.next(header);
  }

  async refreshHeader(url?: string) {
    switch (url) {
      case '/home':
        this.pages[0].img = '/assets/icon/feed-icon-selected.svg';
        this.pages[0].titleClass = 'segment-title-active';
        this.pages[1].img = '/assets/icon/interests-icon.svg';
        this.pages[1].titleClass = 'segment-title';
        this.pages[2].img = '/assets/icon/briefs-icon.svg';
        this.pages[2].titleClass = 'segment-title';
        this.pages[3].img = '/assets/icon/collections-icon.svg';
        this.pages[3].titleClass = 'segment-title';
        this.pages[4].img = '/assets/icon/solvers-icon.svg';
        this.pages[4].titleClass = 'segment-title';
        break;
      case '/interests':
        this.pages[0].img = '/assets/icon/feed-icon.svg';
        this.pages[0].titleClass = 'segment-title';
        this.pages[1].img = '/assets/icon/interests-icon-selected.svg';
        this.pages[1].titleClass = 'segment-title-active';
        this.pages[2].img = '/assets/icon/briefs-icon.svg';
        this.pages[2].titleClass = 'segment-title';
        this.pages[3].img = '/assets/icon/collections-icon.svg';
        this.pages[3].titleClass = 'segment-title';
        this.pages[4].img = '/assets/icon/solvers-icon.svg';
        this.pages[4].titleClass = 'segment-title';
        break;
      case '/briefs':
        this.pages[0].img = '/assets/icon/feed-icon.svg';
        this.pages[0].titleClass = 'segment-title';
        this.pages[1].img = '/assets/icon/interests-icon.svg';
        this.pages[1].titleClass = 'segment-title';
        this.pages[2].img = '/assets/icon/briefs-icon-selected.svg';
        this.pages[2].titleClass = 'segment-title-active';
        this.pages[3].img = '/assets/icon/collections-icon.svg';
        this.pages[3].titleClass = 'segment-title';
        this.pages[4].img = '/assets/icon/solvers-icon.svg';
        this.pages[4].titleClass = 'segment-title';
        break;
      case '/collections/my-collections':
        this.pages[0].img = '/assets/icon/feed-icon.svg';
        this.pages[0].titleClass = 'segment-title';
        this.pages[1].img = '/assets/icon/interests-icon.svg';
        this.pages[1].titleClass = 'segment-title';
        this.pages[2].img = '/assets/icon/briefs-icon.svg';
        this.pages[2].titleClass = 'segment-title';
        this.pages[3].img = '/assets/icon/collections-icon-selected.svg';
        this.pages[3].titleClass = 'segment-title-active';
        this.pages[4].img = '/assets/icon/solvers-icon.svg';
        this.pages[4].titleClass = 'segment-title';
        break;
      case '/solvers':
        this.pages[0].img = '/assets/icon/feed-icon.svg';
        this.pages[0].titleClass = 'segment-title';
        this.pages[1].img = '/assets/icon/interests-icon.svg';
        this.pages[1].titleClass = 'segment-title';
        this.pages[2].img = '/assets/icon/briefs-icon.svg';
        this.pages[2].titleClass = 'segment-title';
        this.pages[3].img = '/assets/icon/collections-icon.svg';
        this.pages[3].titleClass = 'segment-title';
        this.pages[4].img = '/assets/icon/solvers-icon-selected.svg';
        this.pages[4].titleClass = 'segment-title-active';
        break;
      default:
        this.pages[0].img = '/assets/icon/feed-icon.svg';
        this.pages[0].titleClass = 'segment-title';
        this.pages[1].img = '/assets/icon/interests-icon.svg';
        this.pages[1].titleClass = 'segment-title';
        this.pages[2].img = '/assets/icon/briefs-icon.svg';
        this.pages[2].titleClass = 'segment-title';
        this.pages[3].img = '/assets/icon/collections-icon.svg';
        this.pages[3].titleClass = 'segment-title';
        this.pages[4].img = '/assets/icon/solvers-icon.svg';
        this.pages[4].titleClass = 'segment-title';
        break;
    }
  }
}
