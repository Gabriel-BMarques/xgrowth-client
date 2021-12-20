import { OnInit, Component, ViewChild } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PanelData } from '@app/shared/models/panelData.model';
import { IItem, Item } from '@app/shared/models/item.model';
import { IonContent } from '@ionic/angular';
import { MockService } from '@app/services/mock.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FileUpload } from 'primeng/fileupload';
import { DataService } from '@app/services/data.service';
import { BriefSupplier } from '@app/shared/models/briefSupplier.model';
import { SwUpdate } from '@angular/service-worker';
import { MigrationService } from '@app/services/migration.service';
import { IBrief } from '@app/shared/models/brief.model';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { NotificationService } from '@app/services/notification.service';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-agreement',
  templateUrl: './agreement.component.html',
  styleUrls: ['./agreement.component.scss']
})
export class AgreementComponent implements IAlertControtllerGuard {
  @ViewChild('fileInput', { static: false })
  fileInput: FileUpload;
  skeletonLoading = true;
  isLoading = true;
  header: string;
  briefId: string;
  agreementForm: FormGroup;
  organizations: any[] = [];
  addAgreement = false;
  notAddAgreement = true;
  typeOfAgreement = false;
  sameAgreement: boolean;
  differentAgreement: boolean;
  file: any;
  filesUrls: [];
  ndaFileName: string;
  delFilesArray: any[] = [];
  brief: IBrief;
  Ndas: any[] = [];
  isEditing: boolean;

  get briefIdentification(): string {
    return this.wizard.entity._id;
  }

  constructor(
    private mockService: MockService,
    private headerService: HeaderService,
    private route: ActivatedRoute,
    public wizard: BriefAddWizardService,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private navigationService: NavigationService
  ) {
    this.createForm();
    this.verifyHeaderLang();
    this.headerService.setHeader(this.header);
  }

  async ionViewWillEnter() {
    this.skeletonLoading = true;
    this.isLoading = true;
    this.wizard.currentView = 7;
    await this.checkWizardReset();
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
          this.organizations = briefSuppliers.body;
          this.prepareDataToEdit();
          this.isLoading = false;
          this.skeletonLoading = false;
        });
    } else {
      this.isLoading = false;
      this.skeletonLoading = false;
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

  prepareDataToEdit() {
    switch (this.wizard.entity.NdaRequirementMode) {
      case 1:
        this.sameAgreement = true;
        this.differentAgreement = false;
        this.addAgreement = true;
        this.notAddAgreement = false;
        break;
      case 2:
        this.addAgreement = false;
        this.notAddAgreement = true;
        break;
      case 3:
        this.sameAgreement = false;
        this.differentAgreement = true;
        this.addAgreement = true;
        this.notAddAgreement = false;
        break;
      default:
        break;
    }
  }

  addedSolversNda() {
    let counter = 0;
    this.organizations.map(organization => {
      if (organization.Nda) {
        counter++;
      }
    });
    if (counter === this.organizations.length) {
      return true;
    } else {
      return false;
    }
  }

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'NON-DISCLOSURE AGREEMENT';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Acordo de Não Divulgação';
    }
  }

  notAdd() {
    this.addAgreement = false;
    this.sameAgreement = undefined;
    this.wizard.entity.NdaRequirementMode = 2;
    if (this.wizard.entity.Nda) {
      this.wizard.entity.Nda = undefined;
    }
    this.dataService.update('/brief', this.wizard.entity).toPromise();
  }

  add() {
    this.addAgreement = true;
    this.notAddAgreement = false;
    this.sameAgreement = true;
    this.differentAgreement = false;
    if (this.typeOfAgreement) {
      this.sameAgreement = false;
      this.differentAgreement = true;
      this.wizard.entity.NdaRequirementMode = 3;
      this.dataService.update('/brief', this.wizard.entity).toPromise();
    } else if (!this.typeOfAgreement) {
      this.sameAgreement = true;
      this.differentAgreement = false;
      this.wizard.entity.NdaRequirementMode = 1;
      this.dataService.update('/brief', this.wizard.entity).toPromise();
    }
  }

  different() {
    this.typeOfAgreement = true;
    this.sameAgreement = false;
    this.differentAgreement = true;
    this.wizard.entity.NdaRequirementMode = 3;
    if (this.wizard.entity.Nda) {
      this.deleteFileOfArray(this.getBlobName(this.wizard.entity.Nda.url));
    }
  }

  same() {
    this.typeOfAgreement = false;
    this.sameAgreement = true;
    this.differentAgreement = false;
    this.wizard.entity.NdaRequirementMode = 1;
    this.organizations.map(organization => {
      if (organization.Nda) {
        this.deleteFileOfArray(this.getBlobName(organization.Nda.url), organization);
      }
    });
    this.dataService
      .update('/brief', this.wizard.entity)
      .toPromise()
      .then(() => {});
  }

  getFileUrl(blobName: string) {
    return `https://weleverimages.blob.core.windows.net/app-images/${blobName}`;
  }

  uploadNda(event: any, supplierId?: string, item?: any) {
    console.log(event);
    const fileCount: number = event.files.length;
    item.isLoadingNda = true;
    let formData;
    if (fileCount > 0) {
      event.files.map((file: any) => {
        formData = new FormData();
        formData.append('file', file);
        this.file = {
          Name: file.name,
          Size: file.size,
          Type: file.type.split('.').pop()
        };

        this.dataService
          .upload('/upload', formData)
          .toPromise()
          .then(res => {
            this.file.url = this.getFileUrl(res.body.blob);
            if (!supplierId) {
              item.isLoadingNda = false;
              this.wizard.entity.Nda = this.file;
              this.dataService.update('/brief', this.wizard.entity).toPromise();
            } else {
              this.organizations.map(organization => {
                if (organization.SupplierId._id === supplierId) {
                  item.isLoadingNda = false;
                  organization.Nda = this.file;
                  this.dataService.update('/brief-supplier', organization).toPromise();
                }
              });
            }
          });
      });
      this.fileInput.clear();
    }
  }

  getThumbnailFile(url: any) {
    const Nda = 'https://weleverimages.blob.core.windows.net/app-images/' + url;
    return Nda;
  }

  getBlobName(url: string) {
    const blobName = url.split('https://weleverimages.blob.core.windows.net/app-images/').pop();
    return blobName;
  }

  deleteFileOfArray(request: any, briefSupplier?: any) {
    this.delFilesArray.push(request);
    if (briefSupplier) {
      briefSupplier.Nda = null;
      this.dataService
        .update('/brief-supplier', briefSupplier)
        .toPromise()
        .then(() => {});
    } else {
      this.wizard.entity.Nda = null;
      this.dataService
        .update('/brief', this.wizard.entity)
        .toPromise()
        .then(() => {});
    }
    this.deletePermanently();
  }

  deletePermanently() {
    this.dataService
      .deleteFile('/upload', this.delFilesArray)
      .toPromise()
      .then(res => {
        res.body.map((index: number = 0) => {
          res.body.push(this.delFilesArray[index]);
          index++;
        });
      });
  }

  saveEditChanges() {
    const finish = true;
    this.wizard.saveChanges(finish);
    this.router.navigate(['briefs', 'my-brief', this.wizard.entity._id], { replaceUrl: true });
  }

  next() {
    this.agreementForm.controls.briefSuppliers.setValue(this.organizations);
    this.wizard.step7Form = this.agreementForm;
    this.router.navigate(['/briefs/add-brief/review'], { replaceUrl: true });
  }

  back() {
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/solvers'], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/solvers', 'edit', this.wizard.entity._id], { replaceUrl: true });
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
    this.agreementForm = this.formBuilder.group({
      briefSuppliers: ['', Validators.required]
    });
    this.agreementForm.controls.briefSuppliers.setValue([]);
  }
}
