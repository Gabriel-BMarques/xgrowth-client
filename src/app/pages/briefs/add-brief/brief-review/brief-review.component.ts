import { Component, OnInit, ɵConsole } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MockService } from '@app/services/mock.service';
import { IItem } from '@app/shared/models/item.model';
import { PanelData } from '@app/shared/models/panelData.model';
import { DataService } from '@app/services/data.service';
import { LoadBriefsService } from '@app/services/load-brief.service';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { NotificationService } from '@app/services/notification.service';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-brief-review',
  templateUrl: './brief-review.component.html',
  styleUrls: ['./brief-review.component.scss']
})
export class BriefReviewComponent implements OnInit, IAlertControtllerGuard {
  isLoading = false;
  header: string;
  briefId: string;
  images: string[] = [];
  categories: any[];
  companies: any[];
  countries: any[];
  members: any[];
  solvers: any[];
  attachments: any[];
  brief: any;
  deadline: any;

  constructor(
    private headerService: HeaderService,
    public wizard: BriefAddWizardService,
    private router: Router,
    private route: ActivatedRoute,
    private mockService: MockService,
    private dataService: DataService,
    private loadBriefsService: LoadBriefsService,
    private navigationService: NavigationService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.wizard.currentView = 8;
    this.verifyHeaderLang();
    this.brief = this.wizard.entity;
    this.images = this.wizard.entity.UploadedFiles.map(file => {
      return file.url;
    });
    this.categories = this.wizard.step4Form.controls.categories.value;
    this.companies = this.wizard.step3Form.controls.companies.value;
    this.countries = this.wizard.step3Form.controls.countries.value;
    this.members = this.wizard.step5Form.controls.teamMembers.value;
    this.solvers = this.wizard.step7Form.controls.briefSuppliers.value;
    this.attachments = this.wizard.step2Form.controls.attachments.value;
    const deadline = new Date(this.wizard.entity.Deadline);
    this.deadline = deadline.toString();
    this.isLoading = false;
  }

  ionViewWillEnter() {}

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Review';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Revisão';
    }
  }

  ionViewDidEnter() {
    this.headerService.setHeader(this.header);
    this.briefId = this.route.snapshot.params.id;
    this.isLoading = false;
  }

  getThumbnailImage(url: string) {
    return url;
  }

  saveEditChanges() {
    const finish = true;
    this.wizard.saveChanges(finish);
    this.router.navigate(['briefs', 'my-brief', this.wizard.entity._id], { replaceUrl: true });
  }

  back() {
    this.router.navigate(['briefs/add-brief/agreement'], { replaceUrl: true });
  }

  resetLoaderService() {
    this.loadBriefsService.hasLoadedAdmin = false;
    this.loadBriefsService.hasLoadedReceived = false;
    this.loadBriefsService.hasLoadedSent = false;
  }

  async publish() {
    this.resetLoaderService();
    this.wizard.step8Form.controls.isPublished.setValue(true);
    this.wizard.submit();
  }

  async navigateToBrief() {
    await this.publish();
    this.router.navigate(['/briefs/' + '/my-brief/' + this.brief._id], { replaceUrl: true });
  }
  canDeactivate() {
    return this.navigationService.generateAlertBrief(
      'Discard Brief?',
      'If you leave the brief creation now, you will lose the edited information',
      'Discard',
      'Keep'
    );
  }
}
