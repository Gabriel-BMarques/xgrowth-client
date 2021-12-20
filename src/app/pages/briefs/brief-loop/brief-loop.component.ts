import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserInfoService } from '@app/services/user-info.service';
import { environment } from '@env/environment';

declare let woopra: any;

@Component({
  selector: 'app-brief-loop',
  templateUrl: './brief-loop.component.html',
  styleUrls: ['./brief-loop.component.scss']
})
export class BriefLoopComponent implements OnInit {
  @Input() section: string;
  @Input() class: string;
  @Input() isGrid: boolean;
  @Input() briefs: any[];
  @Input() lastViewed: any[];

  @ViewChild('rowFastAccess') rowFastAccess: any;
  briefLimit: number = 1;

  constructor(public router: Router, private userInfoService: UserInfoService) {}

  get userInfo(): any {
    return this.userInfoService.storedUserInfo;
  }

  async ngOnInit() {
    this.userInfoService.refreshUserInfo();
    if (this.briefs) {
      this.briefs.forEach(function(item) {
        item.visibility = false;
      });
    }
    this.rowFastAccessSize();
  }

  rowFastAccessSize() {
    let cardSize = 298;
    const interval = setInterval(() => {
      if (document.readyState === 'complete') {
        clearInterval(interval);
        this.briefLimit = Math.floor(this.rowFastAccess.nativeElement.offsetWidth / cardSize);
      }
    }, 100);
  }

  get userRole(): string {
    return this.userInfoService.storedUserInfo.role;
  }

  get userId(): string {
    return this.userInfoService.storedUserInfo._id;
  }

  canEdit(entity: any): boolean {
    if (entity.CreatedBy) {
      const createdBy = entity.CreatedBy._id || entity.CreatedBy;
      if (createdBy === this.userId || this.userRole === 'admin') return true;
    }
    return false;
  }

  ngOnChanges(changes: any) {
    // this.setViewMode();
  }

  toggleDiv(index: number) {
    this.briefs[index].visibility = !this.briefs[index].visibility;
    this.briefs.forEach(function(item, i) {
      i !== index ? (item.visibility = false) : '';
    });
  }

  getResizedUrl(file: any) {
    const container = this.getContainerName(file.url);
    if (container === 'cblx-img') {
      if (file.Type === 'gif') return file.url;
      return `${file.url}-SM`;
    } else if (container === 'app-images') {
      const blobName = this.getBlobName(file.url);
      return `https://weleverimages.blob.core.windows.net/${blobName}`;
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

  woopraIdentify(user: any) {
    woopra
      .identify({
        email: user.email,
        id: user.email,
        name: `${user.firstName} ${user.familyName}`,
        firstname: user.firstName,
        familyname: user.familyName,
        company: user.company?.companyName,
        department: user.department,
        jobTitle: user.jobTitle
      })
      .push();
  }
  woopraTrack(user: any) {
    woopra.track('brief edit click', {
      author: user.email,
      id: user.email,
      name: user.email,
      company: user.company.companyName,
      department: user.department,
      jobTitle: user.jobTitle,
      topic: 'Brief Edit Button Clicked',
      title: document.title,
      url: window.location.href
    });
  }

  edit(brief: any) {
    if (environment.production) this.woopraIdentify(this.userInfo), this.woopraTrack(this.userInfo);
    this.router.navigate(['/briefs/add-brief/edit', brief._id], { replaceUrl: true });
  }
  async viewBrief(brief: any) {
    if (this.userRole === 'admin' || brief.sent)
      return this.router.navigate(['/briefs/' + '/my-brief/' + brief._id], { replaceUrl: true });
    if (!brief.sent && brief.isPublic) return this.router.navigate(['/briefs/accept', brief._id], { replaceUrl: true });
    if (!brief.sent && !brief.isPublic)
      return this.router.navigate(['/briefs/upload/', brief._id], { replaceUrl: true });
  }
}
