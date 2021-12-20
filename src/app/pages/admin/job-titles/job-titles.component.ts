import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { PanelData } from '@app/shared/models/panelData.model';
import { MockService } from '@app/services/mock.service';
import { ModalController, IonContent, AlertController } from '@ionic/angular';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ModalPageComponent } from '@app/shared/modals/modal/modal.component';
import { DataService } from '@app/services/data.service';
import { ModalJobTitleComponent } from './modal-jobtitles/modal-job-title.component';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-admin-job-titles',
  templateUrl: './job-titles.component.html',
  styleUrls: ['./job-titles.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class JobTitlesComponent implements OnInit {
  header: string;
  isLoading = false;
  jobTitles: any[];
  panelData: PanelData;
  jobTitleData: MatTableDataSource<any>;
  currentModal: any;
  skeletonLoading = true;
  searchActive: boolean = false;

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

  async ngOnInit() {
    this.skeletonLoading = true;
    if (this.platform.is('desktop')) {
      this.isApp = false;
    } else {
      this.isApp = true;
    }
    this.panelData = {
      type: 'organizations',
      name: 'Organizations',
      items: []
    };
    await this.refreshJobTitles();
  }

  ionViewWillEnter() {}

  ionViewDidEnter() {
    this.headerService.setHeader('Job Titles');
    this.isLoading = true;
  }

  toggleTooltipInfo() {
    this.showTooltipInfo = !this.showTooltipInfo;
  }

  async refreshJobTitles() {
    this.skeletonLoading = true;
    await this.dataService
      .list('/misc/job-title')
      .toPromise()
      .then(res => {
        this.jobTitles = res.body;
        this.jobTitleData = new MatTableDataSource(this.jobTitles.slice(0, 16));
        this.refreshPanelData();
        this.jobTitleData.paginator = this.paginator;
        this.jobTitleData.sort = this.sort;
        this.skeletonLoading = false;
      });

    this.isLoading = false;
  }

  refreshPanelData() {
    this.panelData.items = [];
    Object.entries(this.jobTitleData.filteredData).forEach(([key, value]) => {
      const jobTitle = this.jobTitleData.filteredData[key];
      this.panelData.items.push({
        id: jobTitle._id,
        title: jobTitle.name,
        subtitle: jobTitle.domain
      });
    });
  }

  async itemClick(entity?: any) {
    const modal = this.modalController.create({
      component: ModalJobTitleComponent,
      componentProps: {
        jobTitle: entity
      }
    });
    (await modal).present();
    this.currentModal = modal;
    (await modal).onDidDismiss().then(response => {
      entity = response.data;
      this.refreshJobTitles();
    });
  }

  async delete(entity?: any) {
    this.alertController
      .create({
        header: 'Are you sure?',
        message: 'Delete job title',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            handler: async () => {
              await this.dataService.remove('/misc/job-title', entity).toPromise();
              this.refreshJobTitles();
            }
          }
        ]
      })
      .then(alerEl => {
        alerEl.present();
      });
  }

  applyFilter(filterValue: string) {
    if (filterValue === null || filterValue === '') {
      this.jobTitleData = new MatTableDataSource(this.jobTitles.slice(0, 16));
      this.searchActive = false;
    } else {
      this.jobTitleData = new MatTableDataSource(this.jobTitles);
      this.jobTitleData.filter = filterValue.trim().toLowerCase();
      this.searchActive = true;
    }

    if (this.jobTitleData.paginator) {
      this.jobTitleData.paginator.firstPage();
    }
    this.refreshPanelData();
  }

  loadData(event: any) {
    this.isLoading = true;
    this.jobTitleData = new MatTableDataSource(this.jobTitles.slice(0, this.jobTitleData.data.length + 7));
    this.refreshPanelData();
    this.jobTitleData.paginator = this.paginator;
    this.jobTitleData.sort = this.sort;
    event.target.complete();
    if (this.jobTitleData.data.length === this.jobTitles.length) {
      event.target.disabled = true;
    }
    this.isLoading = false;
  }

  async addJobTitle() {
    const modal = this.modalController.create({
      component: ModalJobTitleComponent,
      componentProps: {
        jobTitle: ''
      }
    });

    (await modal).present();
    this.currentModal = modal;
    (await modal).onDidDismiss().then(() => {
      this.refreshJobTitles();
    });
  }

  dismissModal() {
    if (this.currentModal) {
      this.currentModal.dismiss().then(() => {
        this.currentModal = null;
      });
    }
  }
}
