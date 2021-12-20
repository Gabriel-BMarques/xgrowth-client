import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { MockService } from '@app/services/mock.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IonContent, ModalController } from '@ionic/angular';
import { DataService } from '@app/services/data.service';
import { ModalPageComponent } from '@app/shared/modals/modal/modal.component';
import { INotification } from '@app/shared/models/notification.model';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-admin-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdminNotificationsComponent implements OnInit {
  header: string;
  isLoading = false;
  notifications: INotification[];
  notificationData: MatTableDataSource<INotification>;
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
    public platform: Platform
  ) {}

  ngOnInit() {
    if (this.platform.is('desktop')) {
      this.isApp = false;
    } else {
      this.isApp = true;
    }
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Notifications';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Notificações';
    }

    this.skeletonLoading = true;
    setTimeout(() => {
      this.dataService.listAll('/notification').subscribe(notifications => {
        this.notifications = notifications.body;
        this.notificationData = new MatTableDataSource(this.notifications.slice(0, 14));
        this.notificationData.paginator = this.paginator;
        this.notificationData.sort = this.sort;
        this.skeletonLoading = false;
      });
    }, 100);
  }

  ionViewWillEnter() {}

  ionViewDidEnter() {
    this.headerService.setHeader(this.header);
    this.isLoading = true;
  }

  toggleTooltipInfo() {
    this.showTooltipInfo = !this.showTooltipInfo;
  }

  refreshNotifications() {
    this.skeletonLoading = true;
    setTimeout(() => {
      this.dataService.listAll('/notification').subscribe(notifications => {
        this.notifications = notifications.body;
        this.notificationData = new MatTableDataSource(this.notifications.slice(0, 14));
        this.notificationData.paginator = this.paginator;
        this.notificationData.sort = this.sort;
        this.skeletonLoading = false;
      });
    }, 100);
  }

  applyFilter(filterValue: string) {
    if (filterValue === null) {
      this.notificationData.filter = '';
    } else {
      this.notificationData.filter = filterValue.trim().toLowerCase();
    }

    if (this.notificationData.paginator) {
      this.notificationData.paginator.firstPage();
    }
  }

  loadData(event: any) {
    this.notificationData = new MatTableDataSource(this.notifications.slice(0, this.notificationData.data.length + 14));
    this.notificationData.paginator = this.paginator;
    this.notificationData.sort = this.sort;
    event.target.complete();
    if (this.notificationData.data.length === this.notifications.length) {
      event.target.disabled = true;
    }
  }

  itemClick(id?: string) {
    this.editNotification(id);
  }

  async editNotification(id?: string) {
    const modal = this.modalController.create({
      component: ModalPageComponent,
      componentProps: {
        id,
        type: 'notification'
      }
    });

    (await modal).present();
    this.currentModal = modal;
  }

  async addNotification() {
    const modal = this.modalController.create({
      component: ModalPageComponent,
      componentProps: {
        type: 'notification'
      }
    });

    (await modal).present();
    this.currentModal = modal;
  }

  dismissModal() {
    if (this.currentModal) {
      this.currentModal.dismiss().then(() => {
        this.currentModal = null;
      });
    }
  }
}
