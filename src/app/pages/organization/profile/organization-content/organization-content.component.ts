import { Component, Input, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { UserInfoService } from '@app/services/user-info.service';
import { IBrief } from '@app/shared/models/brief.model';
import { IOrganization } from '@app/shared/models/organizations.model';
import { IPost } from '@app/shared/models/post.model';
import { IUser } from '@app/shared/models/user.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-organization-content',
  templateUrl: './organization-content.component.html',
  styleUrls: ['./organization-content.component.scss']
})
export class OrganizationContentComponent implements OnInit {
  organizationId: string;
  initialTab: string;
  userInfo: IUser;
  organization: IOrganization;
  organizationPosts: IPost[] = [];
  organizationPostsAux: IPost[] = [];
  organizationBriefs: IBrief[] = [];
  organizationBriefsAux: IBrief[] = [];
  organizationBriefResponses: IBrief[] = [];
  organizationBriefResponsesAux: IBrief[] = [];
  loadingData: boolean = true;
  canEdit: boolean;
  isEditing: boolean = false;
  viewport: string;
  profileTabs: any[] = [
    {
      label: 'posts',
      id: 'posts',
      isActive: true
    },
    {
      label: 'briefs',
      id: 'briefs',
      isActive: true
    },
    {
      label: 'brief responses',
      id: 'brief-responses',
      isActive: true
    }
  ];
  selectedTabIndex: number = 0;
  selectedTabLabel: string;

  loadingBriefResponses: boolean = true;
  loadingBriefs: boolean = true;
  loadingPosts: boolean = true;

  public get activeTabs() {
    return this.profileTabs.filter(t => t.isActive === true);
  }

  private get isCurrentOrganization(): boolean {
    return this.userInfo.organization._id === this.organizationId;
  }

  constructor(
    private dataService: DataService,
    public route: ActivatedRoute,
    private userInfoService: UserInfoService
  ) {}

  ngOnDestroy(): void {
    this.organizationBriefs = this.organizationBriefsAux = [];
    this.organizationPosts = this.organizationPostsAux = [];
  }

  loadData(event: any, type: string) {
    switch (type) {
      case 'posts':
        this.organizationPosts = this.organizationPostsAux.slice(0, this.organizationPosts.length + 12);
        event.target.complete();
        if (this.organizationPosts.length === this.organizationPostsAux.length) {
          event.target.disabled = true;
        }
        break;
      case 'briefs':
        this.organizationBriefs = this.organizationBriefsAux.slice(0, this.organizationBriefs.length + 12);
        event.target.complete();
        if (this.organizationBriefs.length === this.organizationBriefsAux.length) {
          event.target.disabled = true;
        }
        break;
      case 'brief-responses':
        this.organizationBriefResponses = this.organizationBriefResponsesAux.slice(
          0,
          this.organizationBriefResponses.length + 12
        );
        event.target.complete();
        if (this.organizationBriefResponses.length === this.organizationBriefResponsesAux.length) {
          event.target.disabled = true;
        }
        break;
      default:
        break;
    }
  }

  switchTab(event: MatTabChangeEvent) {
    this.selectedTabLabel = event.tab.textLabel;
    this.loadingData = true;
    this.changeTab(this.selectedTabLabel);
    this.loadingData = false;
  }

  async listPosts(currentOrganization: boolean) {
    if (this.userInfo.role === 'admin') {
      await this.dataService
        .list('/post/organization', { organizationId: this.organizationId })
        .toPromise()
        .then(posts => {
          this.organizationPostsAux = posts.body;
          this.organizationPosts = this.organizationPostsAux.slice(0, 24);
        });
    } else {
      this.organizationPostsAux = (
        await this.dataService.list('/post/feed', { organization: this.organization._id }).toPromise()
      ).body;
      this.organizationPosts = this.organizationPostsAux.slice(0, 24);
    }
  }

  async ngOnInit(): Promise<void> {
    this.userInfo = this.userInfoService.storedUserInfo;
    let { data } = this.route.snapshot.data;
    this.organization = data;
    this.organizationId = this.organization._id;
    this.canEdit = this.userInfo?.organization?._id == this.organization._id || this.userInfo?.role == 'admin';
    this.setInitialViewport(window.innerWidth);
    this.route.queryParams.subscribe(params => {
      this.initialTab = params['initialTab'];
      this.setInitialTab(params['initialTab']);
    });
    this.loadingData = false;
  }

  async setInitialTab(initialTab: string) {
    this.profileTabs.map((tab, index) => {
      if (tab.id === initialTab) this.selectedTabIndex = index;
    });
    this.selectedTabLabel = this.profileTabs[this.selectedTabIndex].label;
    await this.changeTab(this.selectedTabLabel);
  }

  private setInitialViewport(width: number) {
    this.viewport = width <= 761 ? 'mobile' : 'desktop';
  }

  private async changeTab(tabLabel: string) {
    if (tabLabel === 'briefs' && !this.organizationBriefs?.length) {
      this.loadingBriefs = true;
      const briefQuery = {
        sentOrReceived: this.isCurrentOrganization ? 'sent' : 'participating',
        organization: this.organizationId
      };
      if (this.userInfo.role === 'admin') delete briefQuery.sentOrReceived;
      this.organizationBriefsAux = (await this.dataService.list('/brief/main-page', briefQuery).toPromise()).body;
      this.organizationBriefs = this.organizationBriefsAux.slice(0, 24);
      this.loadingBriefs = false;
    }
    if (tabLabel === 'brief responses' && !this.organizationBriefResponses?.length) {
      this.loadingBriefResponses = true;

      this.organizationBriefResponsesAux = (
        await this.dataService.list(`/post/brief-responses/by-organization/${this.organization._id}`).toPromise()
      ).body;

      this.organizationBriefResponses = this.organizationBriefResponsesAux.slice(0, 24);
      this.loadingBriefResponses = false;
    }
    if (tabLabel === 'posts' && !this.organizationPosts?.length) {
      this.loadingPosts = true;
      await this.listPosts(this.isCurrentOrganization);
      this.loadingPosts = false;
    }
  }
}
