import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { DataService } from '@app/services/data.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertController, IonContent, ModalController } from '@ionic/angular';
import { ModalBusinessUnitsComponent } from './modal-business-units/modal-business-units.component';
import { IBusinessUnit } from '@app/shared/models/businessUnit.model';

@Component({
  selector: 'app-business-units',
  templateUrl: './business-units.component.html',
  styleUrls: ['./business-units.component.scss']
})
export class BusinessUnitsComponent implements OnInit {
  header: string;
  isLoading = false;
  businessUnits: IBusinessUnit[];
  businessUnitsData: MatTableDataSource<IBusinessUnit>;
  currentModal: any;
  skeletonLoading = true;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(IonContent, { static: true }) contentArea: IonContent;

  constructor(
    private headerService: HeaderService,
    private modalController: ModalController,
    private dataService: DataService,
    public alertController: AlertController
  ) {}

  ngOnInit() {
    this.skeletonLoading = true;
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Companies';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Empresas';
    }
    setTimeout(() => {
      this.dataService
        .listAll('/businessUnit')
        .toPromise()
        //lazy loading
        .then(businessUnit => {
          this.businessUnits = businessUnit.body;
          this.businessUnitsData = new MatTableDataSource(this.businessUnits.slice(0, 14));
          this.businessUnitsData.paginator = this.paginator;
          this.businessUnitsData.sort = this.sort;
          this.skeletonLoading = false;
        });
    }, 100);
  }

  ionViewWillEnter() {}

  ionViewDidEnter() {
    this.headerService.setHeader(this.header);
    this.isLoading = true;
  }

  refreshBusinessUnits() {
    this.skeletonLoading = true;
    setTimeout(() => {
      this.dataService
        .listAll('/businessUnit')
        .toPromise()
        .then(businessUnit => {
          this.businessUnits = businessUnit.body;
          this.businessUnitsData = new MatTableDataSource(this.businessUnits.slice(0, 14));
          this.businessUnitsData.paginator = this.paginator;
          this.businessUnitsData.sort = this.sort;
          this.skeletonLoading = false;
        });
    }, 100);
  }

  //Search bar
  applyFilter(filterValue: string) {
    if (filterValue === null) {
      this.businessUnitsData.filter = '';
    } else {
      this.businessUnitsData = new MatTableDataSource(this.businessUnits);
      this.businessUnitsData.filter = filterValue.trim().toLowerCase();
    }

    if (this.businessUnitsData.paginator) {
      this.businessUnitsData.paginator.firstPage();
    }
  }

  loadData(event: any) {
    this.businessUnitsData = new MatTableDataSource(
      this.businessUnits.slice(0, this.businessUnitsData.data.length + 14)
    );
    this.businessUnitsData.paginator = this.paginator;
    this.businessUnitsData.sort = this.sort;
    event.target.complete();
    if (this.businessUnitsData.data.length === this.businessUnits.length) {
      event.target.disabled = true;
    }
  }

  async addbusinessUnits() {
    const modal = await this.modalController.create({
      component: ModalBusinessUnitsComponent
    });
    await modal.present();
    modal.onDidDismiss().then(modalRes => {
      this.refreshBusinessUnits();
    });
  }

  itemClick(entity?: any) {
    this.editCompany(entity);
  }
  async editCompany(entity?: any) {
    const modal = this.modalController.create({
      component: ModalBusinessUnitsComponent,
      componentProps: {
        businessUnits: entity
      }
    });
    (await modal).present();
    this.currentModal = modal;
    (await modal).onDidDismiss().then(response => {
      entity = response.data;
      this.refreshBusinessUnits();
    });
  }

  async delete(item?: any) {
    this.alertController
      .create({
        header: 'Are you sure?',
        message: 'Delete Busnisess Unit',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            handler: () => {
              this.dataService
                .remove('/businessUnit', item)
                .toPromise()
                .then(res => {
                  this.refreshBusinessUnits();
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
