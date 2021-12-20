import { Component, OnInit } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { PostAddWizardService } from '@app/services/post-add-wizard.service';
import { FormGroup, FormBuilder, Validator, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IPost } from '@app/shared/models/post.model';
import { DataService } from '@app/services/data.service';
import { NotificationService } from '@app/services/notification.service';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-post-categories',
  templateUrl: './post-categories.component.html',
  styleUrls: ['./post-categories.component.scss']
})
export class PostCategoriesComponent implements OnInit, IAlertControtllerGuard {
  header: string;
  isLoading = true;
  postCategoriesForm: FormGroup;
  categoriesCounter: number;
  id: string;
  post: IPost;

  constructor(
    public wizard: PostAddWizardService,
    private headerService: HeaderService,
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private navigationService: NavigationService
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.verifyHeaderLang();
    this.headerService.setHeader(this.header);
    await this.checkWizardReset();
    this.loadData();
    this.isLoading = false;
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
      this.header = 'categories';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'categorias';
    }
  }

  loadData() {
    this.postCategoriesForm = this.wizard.step2Form;
    this.categoriesCounter = this.wizard.step2Form.controls.categories.length;
  }

  saveEditChanges() {
    this.wizard.step1Form = this.postCategoriesForm;
    this.wizard.saveChanges();
    this.router.navigate(['/post/add/preview'], {
      replaceUrl: true
    });
  }

  back() {
    if (this.wizard.isEditing) {
      this.router.navigate(['/post', 'add', 'edit', this.wizard.entity._id], { replaceUrl: true });
    } else {
      this.router.navigate(['/post/add'], { replaceUrl: true });
    }
  }

  addCategories() {
    if (this.wizard.isEditing) {
      this.router.navigate(['/post', 'add', 'edit', 'add-categories', this.route.snapshot.params.id], {
        replaceUrl: true
      });
    } else {
      this.router.navigate(['/post/add/add-categories', { replaceUrl: true }]);
    }
  }

  next() {
    this.wizard.next();
    if (this.wizard.isEditing) {
      this.router.navigate(['/post', 'add', 'edit', 'terms-and-conditions', this.route.snapshot.params.id], {
        replaceUrl: true
      });
    } else {
      this.router.navigate(['/post/add/terms-and-conditions'], { replaceUrl: true });
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
