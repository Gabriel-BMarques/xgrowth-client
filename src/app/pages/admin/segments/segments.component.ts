import { ICompanyProfile } from './../../../shared/models/companyProfile.model';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { PanelData } from '@app/shared/models/panelData.model';
import { MockService } from '@app/services/mock.service';
import { ModalPageComponent } from '@app/shared/modals/modal/modal.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IonContent, ModalController } from '@ionic/angular';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '@app/services/data.service';
import { AlertController } from '@ionic/angular';
import { ModalSegmentsComponent } from './modal-segments/modal-segments.component';
import { ISegment, Segment } from '@app/shared/models/segment.model';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-segments',
  templateUrl: './segments.component.html',
  styleUrls: ['./segments.component.scss']
})
export class SegmentsComponent implements OnInit {
  header: string;
  isLoading = false;
  segment: ISegment[];
  segmentData: MatTableDataSource<ISegment>;
  currentModal: any;
  skeletonLoading = true;

  isApp: boolean = false;
  showTooltipInfo: boolean = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(IonContent, { static: true }) contentArea: IonContent;

  constructor(
    private headerService: HeaderService,
    private mockService: MockService,
    private modalController: ModalController,
    private dataService: DataService,
    public alertController: AlertController,
    public platform: Platform
  ) {}

  ngOnInit() {
    this.skeletonLoading = true;
    if (this.platform.is('desktop')) {
      this.isApp = false;
    } else {
      this.isApp = true;
    }
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Companies';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Empresas';
    }
    setTimeout(() => {
      this.dataService
        .listAll('/segments')
        .toPromise()
        //lazy loading
        .then(segments => {
          this.segment = segments.body;
          this.segmentData = new MatTableDataSource(this.segment.slice(0, 14));
          this.segmentData.paginator = this.paginator;
          this.segmentData.sort = this.sort;
          this.skeletonLoading = false;
        });
    }, 100);
  }

  toggleTooltipInfo() {
    this.showTooltipInfo = !this.showTooltipInfo;
  }

  ionViewWillEnter() {}

  ionViewDidEnter() {
    this.headerService.setHeader(this.header);
    this.isLoading = true;
  }

  refreshCompanies() {
    this.skeletonLoading = true;
    setTimeout(() => {
      this.dataService
        .listAll('/segments')
        .toPromise()
        .then(segments => {
          this.segment = segments.body;
          this.segmentData = new MatTableDataSource(this.segment.slice(0, 14));
          this.segmentData.paginator = this.paginator;
          this.segmentData.sort = this.sort;
          this.skeletonLoading = false;
        });
    }, 100);
  }

  //Search bar
  applyFilter(filterValue: string) {
    if (filterValue === null) {
      this.segmentData.filter = '';
    } else {
      this.segmentData = new MatTableDataSource(this.segment);
      this.segmentData.filter = filterValue.trim().toLowerCase();
    }

    if (this.segmentData.paginator) {
      this.segmentData.paginator.firstPage();
    }
  }

  loadData(event: any) {
    this.segmentData = new MatTableDataSource(this.segment.slice(0, this.segmentData.data.length + 14));
    this.segmentData.paginator = this.paginator;
    this.segmentData.sort = this.sort;
    event.target.complete();
    if (this.segmentData.data.length === this.segment.length) {
      event.target.disabled = true;
    }
  }

  // aqui nao foi
  itemClick(entity?: any) {
    this.editCompany(entity);
  }

  async editCompany(entity?: any) {
    const modal = this.modalController.create({
      component: ModalSegmentsComponent,
      componentProps: {
        segment: entity
      }
    });

    (await modal).present();
    this.currentModal = modal;
  }

  //Calling modall
  async addSegment() {
    const modal = await this.modalController.create({
      component: ModalSegmentsComponent
    });

    await modal.present();

    modal.onDidDismiss().then(modalRes => {
      this.refreshCompanies();
    });
  }
  delete(item?: any) {
    this.alertController
      .create({
        header: 'Are you sure?',
        message: 'Delete Segment',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            handler: () => {
              this.dataService
                .remove('/segments', item)
                .toPromise()
                .then(res => {
                  this.refreshCompanies();
                });
            }
          }
        ]
      })
      .then(alerEl => {
        alerEl.present();
      });
  }
}
