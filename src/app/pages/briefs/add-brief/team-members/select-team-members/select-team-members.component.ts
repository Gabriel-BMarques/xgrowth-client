import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';
import { FormGroup } from '@angular/forms';
import { DataService } from '@app/services/data.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IonContent } from '@ionic/angular';
import { IBriefMember, BriefMember } from '@app/shared/models/briefMember.model';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { NotificationService } from '@app/services/notification.service';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-select-team-members',
  templateUrl: './select-team-members.component.html',
  styleUrls: ['./select-team-members.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SelectTeamMembersComponent implements IAlertControtllerGuard {
  members: any[] = [];
  membersSelected: any[] = [];
  memberData: MatTableDataSource<any>;
  header: string;
  searchbar: string;
  isLoading: boolean;
  isEditing: boolean;
  id: string;
  departments: any[];
  jobTitles: any[];
  briefMembers: any[];
  briefid: string;
  membersForm: FormGroup;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(IonContent, { static: true }) contentArea: IonContent;

  constructor(
    private headerService: HeaderService,
    private wizard: BriefAddWizardService,
    private router: Router,
    private route: ActivatedRoute,
    private navigationService: NavigationService,
    private dataService: DataService
  ) {
    this.verifyHeaderLang();
    this.headerService.setHeader(this.header);
    this.headerService.setHeader(this.searchbar);
  }

  async ionViewWillEnter() {
    this.isLoading = true;
    await this.checkWizardReset();
    await this.dataService
      .listCoworkers()
      .toPromise()
      .then(members => {
        this.members = members.body;
        this.memberData = new MatTableDataSource(this.members);
        this.memberData.paginator = this.paginator;
        this.memberData.sort = this.sort;
        this.loadData();
      });
    this.isLoading = false;
  }

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Select Team Members';
      this.searchbar = 'Search Team Members';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Selecionar Membros';
      this.searchbar = 'Procurar Membros';
    }
  }
  async checkWizardReset() {
    if (this.wizard.isReseted) await this.resetBriefCreation();
  }

  async resetBriefCreation() {
    const briefId = this.route.snapshot.params.id;
    if (!briefId) this.router.navigate(['/briefs'], { replaceUrl: true });
    else this.wizard.entity._id = briefId;
    await this.wizard.loadWizard();
  }

  loadData() {
    this.briefid = this.wizard.entity._id;
    this.briefMembers = this.wizard.step5Form.controls.teamMembers.value;
    this.prepareSelection();
  }

  prepareSelection() {
    this.memberData.filteredData.map(member => {
      if (this.briefMemberExists(member)) {
        this.membersSelected.push(member);
      }
    });
  }

  applyFilter(filterValue: any) {
    if (filterValue === null) {
      this.memberData.filter = '';
    } else {
      this.memberData = new MatTableDataSource(this.members);
      this.memberData.filter = filterValue.trim().toLowerCase();
    }

    if (this.memberData.paginator) {
      this.memberData.paginator.firstPage();
    }
  }

  changeSelection(member: any) {
    !this.membersSelected.includes(member) ? this.selectMember(member) : this.deselectMember(member);
  }

  selectMember(member: any) {
    if (!this.briefMemberExists(member)) {
      const briefMember = new BriefMember();
      briefMember.UserId = member._id;
      briefMember.BriefId = this.briefid;
      this.dataService
        .create('/brief-member', briefMember)
        .toPromise()
        .then(res => {
          res.body.UserId = member;
          this.membersSelected.push(member);
          this.briefMembers.push(res.body);
          this.wizard.step5Form.controls.teamMembers.setValue(this.briefMembers);
        });
    }
  }

  deselectMember(member: any) {
    const index = this.membersSelected.indexOf(member);
    if (this.briefMemberExists(member)) {
      const entity = this.briefMembers.find(briefMember => {
        return briefMember.UserId._id === member._id;
      });
      this.dataService
        .remove('/brief-member', entity)
        .toPromise()
        .then(() => {
          this.membersSelected.splice(index, 1);
          this.briefMembers.splice(this.briefMembers.indexOf(entity), 1);
          this.wizard.step5Form.controls.teamMembers.setValue(this.briefMembers);
        });
    }
  }

  briefMemberExists(member: any) {
    const briefMemberIds = this.briefMembers.map(bm => bm.UserId._id);
    return briefMemberIds.includes(member._id);
  }

  back() {
    if (!this.wizard.step5Form) {
      this.briefMembers.map(briefMember => {
        this.dataService
          .remove('/brief-member', briefMember)
          .toPromise()
          .then(() => {
            this.briefMembers.splice(this.briefMembers.indexOf(briefMember), 1);
          });
      });
      const interval = setInterval(() => {
        if (this.briefMembers.length === 0) {
          clearInterval(interval);
          if (this.wizard.isEditing) {
            this.router.navigate(['/briefs/add-brief/team-members/edit', this.wizard.entity._id], { replaceUrl: true });
          } else {
            this.router.navigate(['/briefs/add-brief/team-members'], { replaceUrl: true });
          }
        }
      }, 100);
    } else {
      if (this.wizard.isEditing) {
        this.router.navigate(['/briefs/add-brief/team-members/edit', this.wizard.entity._id], { replaceUrl: true });
      } else {
        this.router.navigate(['/briefs/add-brief/team-members'], { replaceUrl: true });
      }
    }
  }

  confirmSelection() {
    if (this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/team-members/edit', this.wizard.entity._id], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/team-members'], { replaceUrl: true });
    }
  }
  canDeactivate() {
    if (this.wizard.isEditing) {
      return this.navigationService.generateAlertBrief(
        'Discard Brief?',
        'If you leave the brief edition now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    } else {
      return this.navigationService.generateAlertBrief(
        'Discard Brief?',
        'If you leave the brief creation now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    }
  }
}
