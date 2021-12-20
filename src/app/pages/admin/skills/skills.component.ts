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
import { ISkill } from '@app/shared/models/skill.model';
import { ModalSkillsComponent } from './modal-skills/modal-skills.component';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent implements OnInit {
  header: string;
  isLoading = false;
  skill: ISkill[];
  skillData: MatTableDataSource<ISkill>;
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
    console.log(this.isApp);
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Companies';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Empresas';
    }
    setTimeout(() => {
      this.dataService
        .listAll('/skills')
        .toPromise()
        //lazy loading
        .then(skills => {
          this.skill = skills.body;
          this.skillData = new MatTableDataSource(this.skill.slice(0, 14));
          this.skillData.paginator = this.paginator;
          this.skillData.sort = this.sort;
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

  refreshSkills() {
    this.skeletonLoading = true;
    setTimeout(() => {
      this.dataService
        .listAll('/skills')
        .toPromise()
        .then(skill => {
          this.skill = skill.body;
          this.skillData = new MatTableDataSource(this.skill.slice(0, 14));
          this.skillData.paginator = this.paginator;
          this.skillData.sort = this.sort;
          this.skeletonLoading = false;
        });
    }, 100);
  }

  //Search bar
  applyFilter(filterValue: string) {
    if (filterValue === null) {
      this.skillData.filter = '';
    } else {
      this.skillData = new MatTableDataSource(this.skill);
      this.skillData.filter = filterValue.trim().toLowerCase();
    }

    if (this.skillData.paginator) {
      this.skillData.paginator.firstPage();
    }
  }

  loadData(event: any) {
    this.skillData = new MatTableDataSource(this.skill.slice(0, this.skillData.data.length + 14));
    this.skillData.paginator = this.paginator;
    this.skillData.sort = this.sort;
    event.target.complete();
    if (this.skillData.data.length === this.skill.length) {
      event.target.disabled = true;
    }
  }

  itemClick(entity?: any) {
    this.editCompany(entity);
  }
  async editCompany(entity?: any) {
    const modal = this.modalController.create({
      component: ModalSkillsComponent,
      componentProps: {
        skill: entity
      }
    });
    (await modal).present();
    this.currentModal = modal;
    (await modal).onDidDismiss().then(response => {
      entity = response.data;
      this.refreshSkills();
    });
  }

  async addSkill() {
    const modal = await this.modalController.create({
      component: ModalSkillsComponent
    });
    await modal.present();
    modal.onDidDismiss().then(modalRes => {
      this.refreshSkills();
    });
  }

  async delete(item?: any) {
    this.alertController
      .create({
        header: 'Are you sure?',
        message: 'Delete skill',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            handler: () => {
              this.dataService
                .remove('/skills', item)
                .toPromise()
                .then(res => {
                  this.refreshSkills();
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
