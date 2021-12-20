import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { ITutorial } from '@app/shared/models/tutorial.model';
import { IUser } from '@app/shared/models/user.model';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-tutorial-details',
  templateUrl: './tutorial-details.component.html',
  styleUrls: ['./tutorial-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TutorialDetailsComponent implements OnInit {
  @Input() tutorialInput: ITutorial;

  tutorial: ITutorial;
  currentUser: IUser;
  reaction: any;
  // state management
  isLoadingReactions: boolean = false;

  constructor(private route: ActivatedRoute, private dataService: DataService, private sanitizer: DomSanitizer) {}

  async ngOnInit() {
    if (!!this.tutorialInput) {
      this.tutorial = this.tutorialInput;
    } else {
      const tutorialId = this.route.snapshot.params.id;
      if (!!tutorialId && tutorialId.length) {
        this.tutorial = (await this.dataService.find('/tutorial', tutorialId).toPromise()).body;
      }
    }
    await this.getReaction();
  }

  htmlText(tutorial: any) {
    let text = this.sanitizer.bypassSecurityTrustHtml(tutorial.text);
    return text;
  }

  async getReaction() {
    this.isLoadingReactions = true;
    this.currentUser = (await this.dataService.getUserProfile().toPromise()).body;
    this.reaction = (
      await this.dataService
        .list('/tutorial-reaction', { userId: this.currentUser.id, tutorialId: this.tutorial._id })
        .toPromise()
    ).body[0];
    this.isLoadingReactions = false;
  }

  async markReaction(type: string) {
    if (!!this.reaction) {
      this.reaction.type = type;
      this.reaction = (await this.dataService.update('/tutorial-reaction', this.reaction).toPromise()).body;
      return;
    }
    this.reaction = { type, userId: this.currentUser.id, tutorialId: this.tutorial._id };
    this.reaction = (await this.dataService.create('/tutorial-reaction', this.reaction).toPromise()).body;
  }

  async ngOnChanges() {
    this.tutorial = this.tutorialInput;
    await this.getReaction();
  }

  getResizedUrl(file: any) {
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
}
