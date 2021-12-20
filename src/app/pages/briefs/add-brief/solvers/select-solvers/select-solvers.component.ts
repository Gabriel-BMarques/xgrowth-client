import { Component, OnInit, ViewChild } from '@angular/core';
import { MockService } from '@app/services/mock.service';
import { HeaderService } from '@app/services/header.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PanelData } from '@app/shared/models/panelData.model';
import { IItem } from '@app/shared/models/item.model';
import { ICompanyRelation, CompanyRelation } from '@app/shared/models/companyRelation.model';
import { DataService } from '@app/services/data.service';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { BriefSupplier, IBriefSupplier } from '@app/shared/models/briefSupplier.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IonContent, ModalController } from '@ionic/angular';
import { ModalReferSolverComponent } from '@app/shared/modals/modal-refer-solver/modal-refer-solver.component';
import { NotificationService } from '@app/services/notification.service';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { NavigationService } from '@app/services/navigation.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-select-solvers',
  templateUrl: './select-solvers.component.html',
  styleUrls: ['./select-solvers.component.scss']
})
export class SelectSolversComponent implements OnInit, IAlertControtllerGuard {
  solversSelected: any[] = [];
  solvers: ICompanyProfile[] = [];
  header: string;
  searchbar: string;
  isLoading = false;
  isEditing: boolean;
  briefId: string;
  briefSuppliers: any[] = [];
  solverData: MatTableDataSource<any>;
  solversForm: FormGroup;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(IonContent, { static: true }) contentArea: IonContent;

  constructor(
    private mockService: MockService,
    private headerService: HeaderService,
    private route: ActivatedRoute,
    private wizard: BriefAddWizardService,
    private router: Router,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private navigationService: NavigationService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.verifyHeaderLang();
    this.headerService.setHeader(this.header);
    this.headerService.setHeader(this.searchbar);
    this.wizard.entity._id
      ? (this.briefId = this.wizard.entity._id)
      : this.route.snapshot.params.id
      ? (this.briefId = this.route.snapshot.params.id)
      : this.router.navigateByUrl('/briefs/add-brief');
    if (this.briefId) {
      this.prepareDataToEdit();
    } else {
      this.isLoading = false;
    }
  }
  async referSolver() {
    const popover = await this.modalController.create({
      component: ModalReferSolverComponent,
      cssClass: 'modal-refer',
      componentProps: {
        brief: this.wizard.entity
      }
    });
    popover.present();
    popover.onDidDismiss().then(modalRes => {});
  }

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Select Solvers';
      this.searchbar = 'Search Solvers';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Selecionar Solvers';
      this.searchbar = 'Procurar Solvers';
    }
  }

  prepareDataToEdit() {
    this.dataService
      .getUserCompany()
      .toPromise()
      .then(currentCompany => {
        this.dataService
          .list('/company-relation', { companyId: currentCompany.body._id })
          .toPromise()
          .then(solvers => {
            const filteredSolvers = solvers.body.filter(solver => {
              return solver.companyB !== undefined || null;
            });
            this.solvers = filteredSolvers.map(company => {
              return company.companyB;
            });
            this.solverData = new MatTableDataSource(this.solvers);
            this.prepareSelection();
            this.isLoading = false;
          });
      });
  }

  prepareSelection() {
    this.dataService
      .listById('/brief-supplier', this.briefId)
      .toPromise()
      .then(res => {
        this.briefSuppliers = res.body;
        this.solverData.filteredData.map(solver => {
          if (this.briefSupplierExists(solver)) {
            this.solversSelected.push(solver);
          }
        });
      });
  }

  applyFilter(filterValue: any) {
    if (filterValue === null) {
      this.solverData.filter = '';
    } else {
      this.solverData = new MatTableDataSource(this.solvers);
      this.solverData.filter = filterValue.trim().toLowerCase();
    }

    if (this.solverData.paginator) {
      this.solverData.paginator.firstPage();
    }
  }

  changeSelection(solver: any) {
    !this.solversSelected.includes(solver) ? this.selectSolver(solver) : this.deselectSolver(solver);
  }

  selectSolver(solver: any) {
    if (!this.briefSupplierExists(solver)) {
      const briefSupplier = new BriefSupplier();
      briefSupplier.BriefId = this.briefId;
      briefSupplier.SupplierId = solver._id;
      this.dataService
        .create('/brief-supplier', briefSupplier)
        .toPromise()
        .then(res => {
          this.solversSelected.push(solver);
          this.dataService
            .listById('/brief-supplier', this.briefId)
            .toPromise()
            .then(briefSuppliers => {
              this.briefSuppliers = briefSuppliers.body;
            });
        });
    }
  }

  deselectSolver(solver: any) {
    if (this.briefSupplierExists(solver)) {
      const entity = this.briefSuppliers.find(briefSupplier => {
        return briefSupplier.SupplierId._id === solver._id;
      });
      this.dataService
        .remove('/brief-supplier', entity)
        .toPromise()
        .then(() => {
          const index = this.solversSelected.indexOf(solver);
          this.solversSelected.splice(index, 1);
          this.briefSuppliers.splice(this.briefSuppliers.indexOf(entity), 1);
        });
    }
  }

  briefSupplierExists(solver: any) {
    const found = this.briefSuppliers.some(briefSupplier => {
      return briefSupplier.SupplierId._id === solver._id;
    });
    if (found) {
      return true;
    } else {
      return false;
    }
  }

  onChanges(): void {
    this.solversForm.valueChanges.subscribe(() => {
      this.wizard.step6Form = _.cloneDeep(this.solversForm);
      this.wizard.saveChanges();
    });
  }

  back() {
    if (this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/solvers/edit', this.wizard.entity._id], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/solvers'], { replaceUrl: true });
    }
  }

  confirmSelection() {
    if (this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/solvers/edit', this.wizard.entity._id], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/solvers'], { replaceUrl: true });
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

  private createForm() {
    this.solversForm = this.formBuilder.group({
      solvers: ['', Validators.required]
    });
    this.onChanges();
  }
}
