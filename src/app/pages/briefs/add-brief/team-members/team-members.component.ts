import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HeaderService } from '@app/services/header.service';
import { IonCheckbox, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';
import { BriefMember } from '@app/shared/models/briefMember.model';
import { IUser } from '@app/shared/models/user.model';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-team-members',
  templateUrl: './team-members.component.html',
  styleUrls: ['./team-members.component.scss']
})
export class TeamMembersComponent implements IAlertControtllerGuard {
  @ViewChild('membersOnlyCheckbox')
  membersOnlyCheckbox: IonCheckbox;

  isLoading = false;
  currentUser: IUser;
  header: string;
  isEditing: boolean;
  briefid: string;
  members: any[] = [];
  briefMembers: any[] = [];
  membersForm: FormGroup;
  currentBriefMember: any;

  get briefId(): string {
    return this.wizard.entity._id;
  }

  constructor(
    private headerService: HeaderService,
    private formBuilder: FormBuilder,
    public wizard: BriefAddWizardService,
    public modalController: ModalController,
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private el: ElementRef,
    private navigationService: NavigationService
  ) {
    this.createForm();
    this.setHeaderLang();
    this.headerService.setHeader(this.header);
  }

  async ionViewWillEnter() {
    this.isLoading = true;
    this.wizard.currentView = 5;
    await this.checkWizardReset();
    await this.loadData();
    this.isLoading = false;
    const interval = setInterval(() => {
      if (this.membersOnlyCheckbox) {
        clearInterval(interval);
        if (this.wizard.entity && this.wizard.entity.MembersOnly) {
          this.membersOnlyCheckbox.checked = this.wizard.entity.MembersOnly;
        }
      }
    });
  }

  setHeaderLang() {
    if (localStorage.getItem('language') === 'en=US') {
      this.header = 'Team Members';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Membros';
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

  async loadData() {
    this.currentUser = (await this.dataService.getUserInfo().toPromise()).body;

    if (this.wizard.isEditing && this.wizard.entity) {
      this.briefMembers = (
        await this.dataService.list('/brief-member', { BriefId: this.wizard.entity._id }).toPromise()
      ).body;
      this.wizard._currentBriefMember = this.briefMembers.find(member => member.UserId._id === this.currentUser.id);
      this.wizard.step5Form.controls.teamMembers.setValue(this.briefMembers);
    } else if (!this.wizard._currentBriefMember) {
      this.currentBriefMember = new BriefMember();
      this.currentBriefMember.UserId = this.currentUser.id;
      this.currentBriefMember.BriefId = this.wizard.entity._id;
      this.currentBriefMember.IsContact = true;
      this.currentBriefMember.Admin = true;
      this.wizard._currentBriefMember = this.currentBriefMember;
      await this.dataService.create('/brief-member', this.currentBriefMember).toPromise();
      this.briefMembers = (
        await this.dataService.list('/brief-member', { BriefId: this.wizard.entity._id }).toPromise()
      ).body;
      console.log(this.briefMembers);
      this.wizard._currentBriefMember = this.briefMembers.find(member => member.UserId._id === this.currentUser.id);
      this.wizard.step5Form.controls.teamMembers.setValue(this.briefMembers);
    }
    this.briefid = this.wizard.entity._id;
    this.membersForm = this.wizard.step5Form;
    this.briefMembers = this.wizard.step5Form.controls.teamMembers.value;
  }

  isSame(id1: string, id2: string) {
    return id1 === id2;
  }

  changeAdmin(entity: any) {
    this.dataService
      .update('/brief-member', entity)
      .toPromise()
      .then(() => {});
  }

  nextToggleButton() {
    if (this.briefMembers.length === 0) {
      return false;
    } else {
      const found = this.briefMembers.some(entity => {
        return entity.IsContact === true;
      });
      return !found;
    }
  }

  changeContact(entity: any) {
    this.briefMembers.forEach((briefMember: any) => {
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

  checkValue(event: any) {}

  disableCheckBox(item: any): boolean {
    return item.UserId._id === this.wizard.entity.CreatedBy._id;
  }

  saveEditChanges() {
    const finish = true;
    this.wizard.saveChanges(finish);
    this.router.navigate(['briefs', 'my-brief', this.wizard.entity._id], { replaceUrl: true });
  }

  async membersOnly(event: any) {
    const membersOnly: boolean = event.detail.checked;
    this.wizard.entity.MembersOnly = membersOnly;
    try {
      await this.dataService.update('/brief', this.wizard.entity).toPromise();
    } catch (error) {
      this.wizard.entity.MembersOnly = !membersOnly;
    }
  }

  removeMember(member: any) {
    const index = this.briefMembers.indexOf(member);
    this.dataService
      .remove('/brief-member', member)
      .toPromise()
      .then(() => {
        this.briefMembers.splice(index, 1);
      });
  }

  briefMemberExists(member: any) {
    const found = this.briefMembers.some(briefMember => {
      return briefMember.UserId.id === member._id;
    });
    if (found) {
      return true;
    } else {
      return false;
    }
  }

  select() {
    this.router.navigate(['/briefs/add-brief/team-members/select-team-members'], { replaceUrl: true });
  }

  next() {
    this.membersForm.controls.teamMembers.setValue(this.briefMembers);
    this.wizard.step5Form = this.membersForm;
    this.wizard.next();
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/solvers'], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/solvers', 'edit', this.wizard.entity._id], { replaceUrl: true });
    }
  }

  back() {
    this.wizard.back();
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/categories'], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/categories', 'edit', this.wizard.entity._id], { replaceUrl: true });
    }
  }

  private createForm() {
    this.membersForm = this.formBuilder.group({
      teamMembers: ['', Validators.required]
    });
    this.membersForm.controls.teamMembers.setValue([]);
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
