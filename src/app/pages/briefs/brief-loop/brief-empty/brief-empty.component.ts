import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserInfoService } from '@app/services/user-info.service';

@Component({
  selector: 'app-brief-empty',
  templateUrl: './brief-empty.component.html',
  styleUrls: ['./brief-empty.component.scss']
})
export class BriefEmptyComponent implements OnInit {
  @Input() isCPG: boolean;
  @Input() incompletedProfile: boolean;

  pageInformations: any = [
    {
      value: 0,
      label: 'Incompleted Profile',
      firstMessage: "You haven't received any briefs yet, but don't worry!",
      secondMessage:
        'You can increase your chances of making new business connections by having an <strong> completed organization profile. </strong>',
      firstButton: 'I want new opportunities',
      secondButton: false
    },
    {
      value: 1,
      label: 'Is CPG',
      firstMessage: "You don't have briefs yet",
      secondMessage:
        'If you have no idea about possibilities, you can always access <strong> your innovation ecosystem </strong> and get insights of the newest trends in the industry or check our <strong> Brief Catalogue </strong>  to get inspired!',
      firstButton: "What's trendy?",
      secondButton: 'I need ideas'
    },
    {
      value: 2,
      label: 'Is not CPG',
      firstMessage: "You haven't received any briefs yet, but don't worry!",
      secondMessage:
        'Be sure to keep your <strong> organization profile information updated </strong> or contact GrowinCo. team to help you.',
      firstButton: 'Organization profile',
      secondButton: 'Contact GrowinCo.'
    }
  ];
  active: number;
  pdfIdeias: any = '../../assets/XGrowth_BriefCatalog.pdf';

  constructor(public router: Router, private userInfoService: UserInfoService) {}

  ngOnInit(): void {
    this.getEmptyMessage();
  }

  getEmptyMessage() {
    if (this.incompletedProfile) this.active = 0;
    else if (this.isCPG) this.active = 1;
    else this.active = 2;
  }

  selectActions(button: any) {
    switch (this.active) {
      case 0:
        this.goToOrganizationProfile('edit');
        break;
      case 1:
        if (button) this.goToFeed();
        else this.openPdf();
        break;
      case 2:
        if (button) this.goToOrganizationProfile('view');
        else this.openEmail();
        break;
      default:
        break;
    }
  }

  goToOrganizationProfile(mode: any) {
    if (mode === 'edit')
      this.router.navigate([`/organization/${this.userInfoService.storedUserInfo.company.organization}/edit`], {
        queryParams: { mode: 'edit' },
        replaceUrl: true
      });
    else
      this.router.navigate([`/organization/${this.userInfoService.storedUserInfo.company.organization}/edit`], {
        queryParams: { mode: 'view' },
        replaceUrl: true
      });
  }

  goToFeed() {
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  openPdf() {
    window.open(this.pdfIdeias, '_blank');
  }

  openEmail() {
    window.location.href = 'mailto:support@growinco.com?subject=xGrowth';
  }
}
