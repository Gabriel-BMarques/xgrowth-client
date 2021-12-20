import { Component, OnInit } from '@angular/core';
import { PanelData } from '@app/shared/models/panelData.model';
import { HeaderService } from '@app/services/header.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MockService } from '@app/services/mock.service';
import { IItem } from '@app/shared/models/item.model';
import { PopoverController } from '@ionic/angular';
import { AcceptModalComponent } from './accept-modal/accept-modal.component';
import { DenyModalComponent } from './deny-modal/deny-modal.component';
import { DataService } from '@app/services/data.service';
import { MigrationService } from '@app/services/migration.service';
import * as fileSaver from 'file-saver';
import { FilesService } from '@app/services/files.service';
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

@Component({
  selector: 'app-pending-nda',
  templateUrl: './pending-nda.component.html',
  styleUrls: ['./pending-nda.component.scss']
})
export class PendingNdaComponent implements OnInit {
  isLoading = true;
  header: string;
  companies: any[];
  accepted: any[] = [];
  denied: any[] = [];
  company: any;
  briefs: any[] = [];

  constructor(
    private headerService: HeaderService,
    private router: Router,
    private route: ActivatedRoute,
    private mockService: MockService,
    private popover: PopoverController,
    private dataService: DataService,
    private migrationService: MigrationService,
    private fileService: FilesService
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    this.verifyHeaderLang();
    await this.loadData();
    this.headerService.setHeader(this.header);
  }

  async ionViewWillEnter() {}

  ionViewDidEnter() {}

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'PENDING NON-DISCLOSURE AGREEMENTS';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'ACORDOS DE NÃO DIVULGAÇÃO PENDENTES';
    }
  }

  async loadData() {
    let counter = 0;

    await this.dataService
      .getUserCompany()
      .toPromise()
      .then(company => {
        this.company = company.body;
      });

    await this.dataService
      .listById('/brief/company', this.company._id)
      .toPromise()
      .then(currentCompanyBriefs => {
        this.briefs = currentCompanyBriefs.body;
      });

    this.briefs.map(brief => {
      this.dataService
        .listById('/brief-supplier', brief._id)
        .toPromise()
        .then(briefSuppliers => {
          counter++;
          briefSuppliers.body.map(briefSupplier => {
            if (briefSupplier.NdaAcceptance === 3 && briefSupplier.SignedNdaFile) {
              if (!this.companies) {
                this.companies = [];
              }
              this.companies.push(briefSupplier);
            }
          });
        });
    });

    const interval = setInterval(() => {
      if (counter > 0 || this.briefs.length === 0) {
        this.isLoading = false;
        clearInterval(interval);
      }
    }, 100);
  }

  async downloadNda(url: string, fileName: string) {
    this.fileService.download(url, fileName);
  }

  async accept(item: any) {
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

  async deny(item: any) {
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

  back() {
    this.router.navigate(['/briefs'], { replaceUrl: true });
  }
}
