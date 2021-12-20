import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HeaderService } from '@app/services/header.service';
import { ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';
import { NotificationService } from '@app/services/notification.service';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-solvers',
  templateUrl: './solvers.component.html',
  styleUrls: ['./solvers.component.scss']
})
export class SolversComponent implements IAlertControtllerGuard {
  isLoading = false;
  header: string;
  isEditing: boolean;
  briefId: string;
  solversForm: FormGroup;
  solvers: any[] = [];

  constructor(
    private headerService: HeaderService,
    public wizard: BriefAddWizardService,
    public modalController: ModalController,
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute,
    private navigationService: NavigationService
  ) {}

  async ionViewWillEnter() {
    this.isLoading = true;
    this.wizard.currentView = 6;
    this.verifyHeaderLang();
    this.headerService.setHeader(this.header);
    await this.checkWizardReset();
    await this.loadData();
    this.isLoading = false;
  }

  async loadData() {
    this.wizard.entity._id
      ? (this.briefId = this.wizard.entity._id)
      : this.route.snapshot.params.id
      ? (this.briefId = this.route.snapshot.params.id)
      : this.router.navigateByUrl('/briefs/add-brief');
    if (this.briefId) {
      this.dataService
        .listById('/brief-supplier', this.briefId)
        .toPromise()
        .then(briefSuppliers => {
          this.solvers = briefSuppliers.body;
        });
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

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en=US') {
      this.header = 'Solvers';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Solvers';
    }
  }

  removeSolver(solver: any) {
    this.dataService
      .remove('/brief-supplier', solver)
      .toPromise()
      .then(() => {
        const index = this.solvers.indexOf(solver);
        this.solvers.splice(index, 1);
      });
  }

  select() {
    this.router.navigate(['/briefs/add-brief/solvers/select-solvers'], { replaceUrl: true });
  }

  saveEditChanges() {
    const finish = true;
    this.wizard.saveChanges(finish);
    this.router.navigate(['briefs', 'my-brief', this.wizard.entity._id], { replaceUrl: true });
  }

  next() {
    this.wizard.next();
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/agreement'], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/agreement', 'edit', this.wizard.entity._id], { replaceUrl: true });
    }
  }

  back() {
    this.wizard.back();
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/team-members'], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/team-members', 'edit', this.wizard.entity._id], { replaceUrl: true });
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
