import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { PanelData } from '@app/shared/models/panelData.model';
import { MockService } from '@app/services/mock.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IUser } from '@app/shared/models/user.model';
import { IonContent, ModalController } from '@ionic/angular';
import { ModalPageComponent } from '@app/shared/modals/modal/modal.component';
import { DataService } from '@app/services/data.service';
import { filter } from 'lodash';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-admin-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdminUsersComponent implements OnInit {
  header: string;
  isLoading = false;
  users: IUser[];
  panelData: PanelData;
  userData: MatTableDataSource<IUser>;
  currentModal: any;
  skeletonLoading = true;

  isApp: boolean = false;
  showTooltipInfo: boolean = false;

  jobTitles: any[];
  departments: any[];
  selectInterfaceOptions: any = {
    cssClass: 'custom-select'
  };

  filteredUsers: IUser[];

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

  async ngOnInit() {
    if (this.platform.is('desktop')) {
      this.isApp = false;
    } else {
      this.isApp = true;
    }
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Users';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Usuários';
    }
    this.skeletonLoading = true;

    const res = await Promise.all([
      this.dataService.listAll('/users').toPromise(),
      this.dataService.list('/misc/job-title').toPromise(),
      this.dataService.list('/misc/department').toPromise()
    ]);
    [this.users, this.jobTitles, this.departments] = res.map(r => r.body);
    this.userData = new MatTableDataSource(this.users.slice(0, 14));
    this.userData.paginator = this.paginator;
    this.userData.sort = this.sort;
    this.skeletonLoading = false;
  }

  async onChange(event: any) {
    if (!event.detail.value.includes('Unhandled')) {
      await this.refreshUsers();
      return;
    }

    if (!event.detail.value.includes('job title')) {
      const jobTitleNames = this.jobTitles.map(jt => jt.name);
      this.users = this.users.filter(user => !jobTitleNames.includes(user.jobTitle));
    } else if (!event.detail.value.includes('department')) {
      const departmentNames = this.departments.map(jt => jt.name);
      this.users = this.users.filter(user => !departmentNames.includes(user.department));
    }
    this.userData = new MatTableDataSource(this.users.slice(0, 14));
    this.userData.paginator = this.paginator;
    this.userData.sort = this.sort;
  }

  ionViewWillEnter() {}

  ionViewDidEnter() {
    this.headerService.setHeader(this.header);
    this.isLoading = true;
  }

  toggleTooltipInfo() {
    this.showTooltipInfo = !this.showTooltipInfo;
  }

  async refreshUsers() {
    this.skeletonLoading = true;
    this.users = (await this.dataService.listAll('/users').toPromise()).body;
    this.userData = new MatTableDataSource(this.users.slice(0, 14));
    this.userData.paginator = this.paginator;
    this.userData.sort = this.sort;
    this.skeletonLoading = false;
  }

  applyFilter(filterValue: string) {
    if (filterValue === null || filterValue === '') {
      this.filteredUsers = [];
      this.userData = new MatTableDataSource(this.users.slice(0, 14));
    } else {
      const searchTerm = filterValue.trim().toLowerCase();
      this.skeletonLoading = true;
      this.filteredUsers = this.users.filter(user => {
        const userFullName: string = `${user.firstName} ${user.familyName}`.trim().toLowerCase();
        const userCompanyName = user.company ? user.company.companyName : '';
        return (
          user.email
            .trim()
            .toLowerCase()
            .includes(searchTerm) ||
          userCompanyName
            .trim()
            .toLowerCase()
            .includes(searchTerm) ||
          userFullName.includes(searchTerm)
        );
      });
      this.userData = new MatTableDataSource(this.filteredUsers.slice(0, 14));
      this.skeletonLoading = false;
    }
    if (this.userData.paginator) {
      this.userData.paginator.firstPage();
    }
  }

  loadData(event: any) {
    if (this.filteredUsers && this.filteredUsers.length) {
      this.userData = new MatTableDataSource(this.filteredUsers.slice(0, this.userData.data.length + 14));
      this.userData.paginator = this.paginator;
      this.userData.sort = this.sort;
      event.target.complete();
      if (this.userData.data.length === this.users.length) {
        event.target.disabled = true;
      }
    } else {
      this.userData = new MatTableDataSource(this.users.slice(0, this.userData.data.length + 14));
      this.userData.paginator = this.paginator;
      this.userData.sort = this.sort;
      event.target.complete();
      if (this.userData.data.length === this.users.length) {
        event.target.disabled = true;
      }
    }
  }

  itemClick(id?: string) {
    this.editUser(id);
  }

  async editUser(id?: string) {
    const modal = this.modalController.create({
      component: ModalPageComponent,
      componentProps: {
        id,
        type: 'user'
      }
    });

    (await modal).present();
    this.currentModal = modal;
  }

  async addUser() {
    const modal = this.modalController.create({
      component: ModalPageComponent,
      componentProps: {
        type: 'user'
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
