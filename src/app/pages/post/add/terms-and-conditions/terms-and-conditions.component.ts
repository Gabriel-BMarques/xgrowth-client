import { Component, OnInit } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PostAddWizardService } from '@app/services/post-add-wizard.service';
import { DataService } from '@app/services/data.service';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { NotificationService } from '@app/services/notification.service';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss']
})
export class TermsAndConditionsComponent implements IAlertControtllerGuard {
  header: string;
  isLoading = true;
  id: string;
  // tslint:disable-next-line: max-line-length
  termsAndConditions =
    'User submits information with the express acknowledgement that it imposes no confidentiality obligations on XGrowth or Content Receiver, unless a specific executed confidentiality, or like, agreement (but excluding general confidentiality clauses in an existing supply agreement) is expressly cited in the submission. Furthermore, User acknowledges that its submission does not breach any confidentiality obligations owed to others. User recognizes that Content Receiver may already be independently working on the same or similar growth opportunity (technology, innovation, new product or ingredient ideas, etc.) as covered by its submission. User agrees that no contractual obligation nor working relationship is created between User and Content Receiver by submitting this information. Each party shall own and continue to own all intellectual property it owned prior to the submission of this posting or brief response or that it created outside of the scope of this brief and/or agreement.';
  accepted = false;

  get postId() {
    return this.wizard.postId;
  }

  get isEditing() {
    return this.wizard.isEditing;
  }

  constructor(
    private headerService: HeaderService,
    private router: Router,
    private route: ActivatedRoute,
    private wizard: PostAddWizardService,
    private dataService: DataService,
    private navigationService: NavigationService
  ) {}

  async ionViewWillEnter() {
    await this.checkWizardReset();
    this.verifyHeaderLang();
    this.headerService.setHeader(this.header);
  }

  async resetPostCreation() {
    const postId = this.route.snapshot.params.id;
    if (!postId) this.router.navigate(['/post/add'], { replaceUrl: true });
    else this.wizard.postId = postId;
    await this.wizard.loadWizard();
  }

  async checkWizardReset() {
    if (this.wizard.isReseted) await this.resetPostCreation();
  }

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'terms and coditions';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'termos e condições';
    }
  }

  back() {
    if (this.isEditing) {
      this.router.navigate(['/post/add/edit/add-categories', this.postId]);
    } else {
      this.router.navigate(['/post/add/add-categories']);
    }
  }

  preview() {
    if (this.isEditing) {
      this.router.navigate(['/post/add/edit/preview', this.postId]);
    } else {
      this.router.navigate(['/post/add/preview']);
    }
  }
  canDeactivate() {
    return this.navigationService.generateAlert(
      'Discard Post?',
      'If you leave the post creation now, you will lose the edited information',
      'Discard',
      'Keep'
    );
  }
}
