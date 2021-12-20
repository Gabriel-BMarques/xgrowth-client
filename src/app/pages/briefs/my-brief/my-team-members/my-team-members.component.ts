import { Component, OnInit } from '@angular/core';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderService } from '@app/services/header.service';
import { MockService } from '@app/services/mock.service';
import { PanelData } from '@app/shared/models/panelData.model';
import { IItem } from '@app/shared/models/item.model';
import { DataService } from '@app/services/data.service';
import { CredentialsService } from '@app/core';
import { IUser } from '@app/shared/models/user.model';

@Component({
  selector: 'app-my-team-members',
  templateUrl: './my-team-members.component.html',
  styleUrls: ['./my-team-members.component.scss']
})
export class MyTeamMembersComponent implements OnInit {
  isLoading = false;
  brief: any;
  header: string;
  isEditing: boolean;
  id: string;
  teamMembers: any[];
  briefId: string;
  userRole: string;
  canEdit: boolean;
  user: IUser;

  constructor(
    private headerService: HeaderService,
    private wizard: BriefAddWizardService,
    private dataService: DataService,
    private router: Router,
    private credentials: CredentialsService,
    private route: ActivatedRoute,
    private mockService: MockService
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    this.userRole = this.credentials.checkRole;

    await this.dataService
      .getUserInfo()
      .toPromise()
      .then(user => {
        this.user = user.body;
      });
    await this.refreshData();
  }

  async ionViewWillEnter() {}

  ionViewDidEnter() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Team Members';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Membros';
    }
    this.headerService.setHeader(this.header);
    this.briefId = this.route.snapshot.params.id;
    this.wizard.isEditing = true;
    this.isLoading = false;
  }

  async refreshData() {
    this.briefId = this.route.snapshot.params.id;
    await this.dataService
      .listById('/brief-member', this.briefId)
      .toPromise()
      .then(briefmembers => {
        this.teamMembers = briefmembers.body;
      });

    await this.dataService
      .find('/brief', this.briefId)
      .toPromise()
      .then(brief => {
        this.brief = brief.body;
      });

    await this.verifyPermissions();
  }

  async verifyPermissions() {
    if (this.brief.CreatedBy) {
      if (this.user.id === this.brief.CreatedBy._id || this.userRole === 'admin') {
        this.canEdit = true;
      } else {
        await this.dataService
          .listById('/brief-member', this.brief._id)
          .toPromise()
          .then(members => {
            const currentBriefMember = members.body.find(member => {
              return member.UserId === this.user.id;
            });
            if (currentBriefMember) {
              currentBriefMember.Admin === true ? (this.canEdit = true) : (this.canEdit = false);
            } else {
              this.canEdit = false;
            }
          });
      }
    } else {
      await this.dataService
        .listById('/brief-member', this.brief._id)
        .toPromise()
        .then(members => {
          const currentBriefMember = members.body.find(member => {
            return member.UserId === this.user.id;
          });
          if (currentBriefMember) {
            currentBriefMember.Admin === true ? (this.canEdit = true) : (this.canEdit = false);
          } else {
            this.canEdit = false;
          }
        });
    }
  }

  async removeMember(member: any) {
    const index = this.teamMembers.indexOf(member);
    await this.dataService
      .remove('/brief-member', member)
      .toPromise()
      .then(() => {
        this.teamMembers.splice(index, 1);
      });
  }

  async changeContact(entity: any) {
    this.teamMembers.forEach((briefMember: any) => {
      if (briefMember._id !== entity._id && briefMember.IsContact === true) {
        briefMember.IsContact = !briefMember.IsContact;
      } else if (briefMember._id === entity._id) {
        briefMember.IsContact = true;
        briefMember.Admin = true;
      }
      this.dataService
        .update('/brief-member', briefMember)
        .toPromise()
        .then(() => {});
    });
  }

  async changeAdmin(entity: any) {
    this.dataService
      .update('/brief-member', entity)
      .toPromise()
      .then(() => {});
  }

  back() {
    this.router.navigate(['/briefs/my-brief', this.briefId], { replaceUrl: true });
  }
}
