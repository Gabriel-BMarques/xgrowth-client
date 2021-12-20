import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { interval } from 'rxjs';
import { ICompanyProfile } from '../../models/companyProfile.model';

@Component({
  selector: 'app-organization-profile-imcomplete',
  templateUrl: './organization-profile-imcomplete.component.html',
  styleUrls: ['./organization-profile-imcomplete.component.scss']
})
export class OrganizationProfileImcompleteComponent implements OnInit {
  @Output() organizationLoadingProgress = new EventEmitter<number>();
  @Input() currentUserCompany: ICompanyProfile;
  @Input() userRole: any;

  organizationId: any;
  companyId: any;
  userRoleCredential: any;
  progress: number;
  counter = 0;
  isLoading = true;
  constructor(private router: Router, private dataService: DataService) {}

  async ngOnInit() {
    this.organizationId = this.currentUserCompany.organization;
    this.companyId = this.currentUserCompany._id;
    this.userRoleCredential = this.userRole;

    const {
      website,
      whoWeAre,
      yearFounded,
      annualSales,
      numberOfEmployees,
      organizationReach,
      organizationType,
      certifications,
      initiatives,
      segments,
      subSegments,
      uploadedContent,
      skills
    } = (await this.dataService.find('/organization', this.organizationId).toPromise()).body;
    const organizationArray = [
      website,
      whoWeAre,
      yearFounded,
      annualSales,
      numberOfEmployees,
      organizationReach,
      organizationType,
      certifications,
      initiatives,
      segments,
      subSegments,
      uploadedContent,
      skills
    ];

    organizationArray.forEach(element => (!element || element.length === 0 ? this.counter++ : ''));
    if (organizationType?.name === 'External Manufacturer') {
      const plantsCount = (
        await this.dataService.count('/plant', null, { organization: this.organizationId }).toPromise()
      ).body;
      organizationArray.push(plantsCount);
      if (plantsCount === 0) this.counter++;
    }
    await this.onProgressBar();

    this.progress = 100 - (this.counter * 100) / organizationArray.length;
    this.isLoading = false;
  }

  async onProgressBar() {
    this.organizationLoadingProgress.emit(this.counter);
  }
  organizationProfile() {
    this.router.navigate(['/organization/' + this.organizationId + '/edit'], { replaceUrl: true });
  }
}
