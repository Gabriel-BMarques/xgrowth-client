import { Component, OnInit, ViewChild } from '@angular/core';
import { PanelData } from '@app/shared/models/panelData.model';
import { HeaderService } from '@app/services/header.service';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MockService } from '@app/services/mock.service';
import { IItem } from '@app/shared/models/item.model';
import { DataService } from '@app/services/data.service';
import { BriefSupplier } from '@app/shared/models/briefSupplier.model';
import { AcceptModalComponent } from '../../pending-nda/accept-modal/accept-modal.component';
import { DenyModalComponent } from '../../pending-nda/deny-modal/deny-modal.component';
import { IonContent, PopoverController } from '@ionic/angular';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CredentialsService } from '@app/core';
import { IUser } from '@app/shared/models/user.model';
import * as fileSaver from 'file-saver';
import { FilesService } from '@app/services/files.service';
import { FileUpload } from 'primeng/fileupload';
import { NotificationService } from '@app/services/notification.service';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { IBrief } from '@app/shared/models/brief.model';
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

@Component({
  selector: 'app-participating-solvers',
  templateUrl: './participating-solvers.component.html',
  styleUrls: ['./participating-solvers.component.scss']
})
export class ParticipatingSolversComponent implements OnInit {
  isLoading = true;
  header: string;
  secondHeader: string;
  searchbar: string;
  isEditing: boolean;
  briefId: string;
  solvers: any[] = [];
  solversSelected: any[] = [];
  invitedSolvers: any[] = [];
  uninvitedSolvers: any[] = [];
  accepted: any[] = [];
  denied: any[] = [];
  brief: any;
  uninvitedSolverData: MatTableDataSource<any>;
  currentCompany: any;
  userRole: string;
  canEdit: boolean;
  user: IUser;
  fileInput: FileUpload;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(IonContent, { static: true }) contentArea: IonContent;

  constructor(
    private headerService: HeaderService,
    private wizard: BriefAddWizardService,
    private router: Router,
    private route: ActivatedRoute,
    private mockService: MockService,
    private dataService: DataService,
    private popover: PopoverController,
    private credentials: CredentialsService,
    private fileService: FilesService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Participating Solvers';
      this.secondHeader = 'Invite Solvers';
      this.searchbar = 'Search for Solvers';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Solvers Participantes';
      this.secondHeader = 'Convide Solvers';
      this.searchbar = 'Procure por Solvers';
    }

    this.headerService.setHeader(this.header);
    this.briefId = this.route.snapshot.params.id;

    this.userRole = this.credentials.checkRole;

    await this.dataService
      .getUserInfo()
      .toPromise()
      .then(user => {
        this.user = user.body;
      });

    await this.dataService
      .getUserCompany()
      .toPromise()
      .then(currentCompany => {
        this.currentCompany = currentCompany.body;
      });

    await this.dataService
      .listById('/brief-supplier', this.briefId)
      .toPromise()
      .then(solvers => {
        this.invitedSolvers = solvers.body;
        this.invitedSolvers.map(invitedSolver => {
          this.isResponded(invitedSolver);
        });
      });

    await this.dataService
      .find('/brief', this.briefId)
      .toPromise()
      .then(brief => {
        this.brief = brief.body;
      });

    await this.dataService
      .list('/company-relation', { companyId: this.brief.ClientId._id })
      .toPromise()
      .then(companyRelations => {
        const compRelations = companyRelations.body.filter(companyRelation => {
          return companyRelation.companyB !== undefined;
        });
        compRelations.map(companyRelation => {
          const found = this.invitedSolvers.find(solver => {
            return solver.SupplierId._id === companyRelation.companyB._id;
          });
          if (!found) {
            this.uninvitedSolvers.push(companyRelation.companyB);
          }
        });
      });

    this.uninvitedSolverData = new MatTableDataSource(this.uninvitedSolvers);
    this.uninvitedSolverData.paginator = this.paginator;
    this.uninvitedSolverData.sort = this.sort;
    this.isLoading = false;

    await this.verifyPermissions();
  }

  async ionViewWillEnter() {}

  ionViewDidEnter() {}

  async uploadNda(event: any, supplier?: any) {
    const fileCount: number = event.files.length;
    supplier.isLoadingNda = true;
    let formData;
    if (fileCount > 0) {
      event.files.forEach(async (file: any) => {
        formData = new FormData();
        formData.append('file', file);
        file = {
          Name: file.name,
          Size: file.size,
          Type: file.type.split('.').pop()
        };
        const blob = (await this.dataService.upload('/upload', formData).toPromise()).body.blob;
        file.url = this.getThumbnailFile(blob);
        supplier.Nda = file;
        await this.dataService.update('/brief-supplier', supplier).toPromise();
        supplier.isLoadingNda = false;
      });
      this.fileInput.clear();
    }
  }

  getThumbnailFile(url: any) {
    const Nda = 'https://weleverimages.blob.core.windows.net/app-images/' + url;
    return Nda;
  }

  async verifyPermissions() {
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
  }

  isResponded(entity: any) {
    console.log(entity);
    this.dataService
      .list('/post', { SupplierId: entity.SupplierId._id, BriefId: this.briefId })
      .toPromise()
      .then(responses => {
        const publishedResponses = responses.body.filter(response => {
          return response.IsDraft !== true;
        });
        if (publishedResponses.length > 0) {
          entity.isResponded = true;
        } else {
          entity.isResponded = false;
        }
      });
  }

  applyFilter(filterValue: any) {
    if (filterValue === null) {
      this.uninvitedSolverData.filter = '';
    } else {
      this.uninvitedSolverData = new MatTableDataSource(this.uninvitedSolvers);
      this.uninvitedSolverData.filter = filterValue.trim().toLowerCase();
    }

    if (this.uninvitedSolverData.paginator) {
      this.uninvitedSolverData.paginator.firstPage();
    }
  }

  async onAccept(item: any) {
    if (item.NdaAcceptance === 2) {
      return;
    } else {
      const modal = await this.popover.create({
        component: AcceptModalComponent,
        componentProps: {
          selected: item,
          array: this.accepted
        },
        cssClass: 'accept-modal'
      });

      modal.present();
    }
  }

  async onDecline(item: any) {
    if (item.NdaAcceptance === 1) {
      return;
    } else {
      const modal = await this.popover.create({
        component: DenyModalComponent,
        componentProps: {
          selected: item,
          array: this.denied
        },
        cssClass: 'deny-modal'
      });

      modal.present();
    }
  }

  isIndividualNda() {
    const foundSupplierNda = this.invitedSolvers.some(solver => {
      return solver.Nda !== undefined;
    });
    return foundSupplierNda;
  }

  sendNewBriefNotification(solver: ICompanyProfile, brief: IBrief): void {
    this.notificationService.sendNewBriefNotifications([solver], brief, true);
  }

  async invite(solver: any) {
    const briefSupplier = new BriefSupplier();
    briefSupplier.BriefId = this.briefId;
    briefSupplier.SupplierId = solver._id;
    await this.dataService
      .create('/brief-supplier', briefSupplier)
      .toPromise()
      .then(entity => {
        const index = this.uninvitedSolvers.indexOf(solver);
        entity.body.SupplierId = solver;
        this.uninvitedSolvers.splice(index, 1);
        this.invitedSolvers.push(entity.body);
        this.sendNewBriefNotification(solver, this.brief);
      });
  }

  async uninvite(briefSupplier: any) {
    await this.dataService
      .remove('/brief-supplier', briefSupplier)
      .toPromise()
      .then(() => {
        const index = this.invitedSolvers.indexOf(briefSupplier);
        this.invitedSolvers.splice(index, 1);
        this.uninvitedSolvers.push(briefSupplier.SupplierId);
      });
  }

  async downloadNda(url: string, fileName: string) {
    this.fileService.download(url, fileName);
  }

  back() {
    this.router.navigate(['/briefs/my-brief', this.briefId], { replaceUrl: true });
  }
}
