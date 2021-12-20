import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import { IResponse, Response } from '@app/shared/models/response.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IUploadedFile } from '@app/shared/models/uploadedFile.model';
import { HeaderService } from '@app/services/header.service';
import { PostAddWizardService } from '@app/services/post-add-wizard.service';
import { ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { ResponseAddWizardService } from '@app/services/response-add-wizard.service';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';
import { NotificationService } from '@app/services/notification.service';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { NavigationService } from '@app/services/navigation.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-market-info',
  templateUrl: './market-info.component.html',
  styleUrls: ['./market-info.component.scss']
})
export class MarketInfoComponent implements IAlertControtllerGuard {
  isLoading = false;
  header: string;
  isEditing: boolean;
  marketInfoForm: FormGroup;
  companies: any[];
  countries: any[];
  deadline: string;

  get briefId(): string {
    return this.wizard.entity._id;
  }

  constructor(
    private headerService: HeaderService,
    private formBuilder: FormBuilder,
    public wizard: BriefAddWizardService,
    public modalController: ModalController,
    private router: Router,
    private route: ActivatedRoute,
    private navigationService: NavigationService
  ) {
    this.setHeaderLang();
    this.headerService.setHeader(this.header);
  }

  // ngOnInit() {
  //   this.isLoading = true;
  //   this.wizard.currentView = 3;
  //   this.headerService.setHeader(this.header);
  //   this.loadData();
  //   this.isLoading = false;
  // }

  async ionViewWillEnter() {
    this.isLoading = true;
    this.wizard.currentView = 3;
    await this.checkWizardReset();
    await this.loadData();
    this.isLoading = false;
  }
  async checkWizardReset() {
    if (this.wizard.isReseted) await this.resetBriefCreation();
  }
  async resetBriefCreation() {
    const briefId = this.route.snapshot.params.id;
    if (!briefId) this.router.navigate(['/briefs'], { replaceUrl: true });
    else this.wizard.entity._id = briefId;
    console.log(this.wizard.entity);
    await this.wizard.loadWizard();
  }

  setHeaderLang() {
    if (localStorage.getItem('language') === 'en=US') {
      this.header = 'Market Info';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Informações de Mercado';
    }
  }

  async loadData() {
    this.marketInfoForm = _.cloneDeep(this.wizard.step3Form);
    this.companies = this.wizard.step3Form.controls.companies.value;
    this.countries = this.wizard.step3Form.controls.countries.value;
    if (this.wizard.entity.Deadline) {
      this.deadline = new Date(this.wizard.entity.Deadline).toString();
    }
  }

  chooseCompany() {
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/market-info/brief-company'], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/market-info/brief-company', 'edit', this.wizard.entity._id], {
        replaceUrl: true
      });
    }
  }

  chooseMarket() {
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/market-info/brief-market'], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/market-info/brief-market', 'edit', this.wizard.entity._id], {
        replaceUrl: true
      });
    }
  }

  chooseDeadline() {
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/market-info/brief-deadline'], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/market-info/brief-deadline', 'edit', this.wizard.entity._id], {
        replaceUrl: true
      });
    }
  }

  saveEditChanges() {
    const finish = true;
    this.wizard.saveChanges(finish);
    this.router.navigate(['briefs', 'my-brief', this.wizard.entity._id], { replaceUrl: true });
  }

  next() {
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/categories'], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/categories', 'edit', this.wizard.entity._id], { replaceUrl: true });
    }
  }

  back() {
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/attachments'], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/attachments', 'edit', this.wizard.entity._id], { replaceUrl: true });
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
}
