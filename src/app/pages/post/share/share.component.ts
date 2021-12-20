import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '@app/services/data.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IUser } from '@app/shared/models/user.model';
import { IonContent, NavController } from '@ionic/angular';
import { PostShare } from '@app/shared/models/postShare.model';
import { ActivatedRoute, Router, RoutesRecognized } from '@angular/router';
import { Notification, INotification } from '../../../shared/models/notification.model';
import { filter, pairwise } from 'rxjs/operators';
import { Location } from '@angular/common';
import { NotificationService } from '@app/services/notification.service';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit {
  header: string;
  searchbar: string;
  isLoading = true;
  postId: string;
  shareForm: FormGroup;
  coworkers: any[] = [];
  coworkerData: MatTableDataSource<IUser>;
  selectedRecipients: any[] = [];
  postShares: any[] = [];
  user: IUser;
  previousUrl: string;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(IonContent, { static: true }) contentArea: IonContent;

  constructor(
    private headerService: HeaderService,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private navCntrl: NavController,
    private notificationService: NotificationService
  ) {
    this.createForm();
  }

  async ngOnInit() {
    this.router.events
      .pipe(
        filter((evt: any) => evt instanceof RoutesRecognized),
        pairwise()
      )
      .subscribe((events: RoutesRecognized[]) => {
        this.previousUrl = events[0].urlAfterRedirects;
      });
    this.postId = this.route.snapshot.params.id;

    await this.dataService
      .getUserInfo()
      .toPromise()
      .then(user => {
        this.user = user.body;
      });

    await this.dataService
      .listCoworkers()
      .toPromise()
      .then(coworkers => {
        this.coworkers = coworkers.body;
      });

    await this.dataService
      .listById('/post/share/by-post', this.postId)
      .toPromise()
      .then(postShares => {
        this.postShares = postShares.body;
        this.selectedRecipients = postShares.body.map(entity => {
          return entity.RecipientId;
        });
      });

    this.coworkerData = new MatTableDataSource(this.coworkers);
    this.coworkerData.paginator = this.paginator;
    this.coworkerData.sort = this.sort;

    this.coworkers.map(entity => {
      const found = this.selectedRecipients.find(user => {
        return user._id === entity._id;
      });
      if (found) {
        entity.selected = true;
      }
    });
    this.isLoading = false;
  }

  async ionViewWillEnter() {}

  ionViewDidEnter() {
    this.verifyHeaderLang();
  }

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Share';
      this.searchbar = 'Search for coworkers';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Compartilhar';
      this.searchbar = 'Procurar coworkers';
    }
  }

  cancel() {
    this.navCntrl.navigateBack(['/post/details/', this.postId]);
  }

  share() {
    this.selectedRecipients.map(coworker => {
      let postShare = new PostShare();

      postShare = {
        PostId: this.postId,
        RecipientId: coworker._id,
        Description: this.shareForm.controls.comment.value
      };

      this.dataService
        .create('/post/share', postShare)
        .toPromise()
        .then(() => {});

      this.notificationService.sendPostShareNotification(this.user, this.postId, coworker);
    });

    this.router.navigate(['/post/details', this.postId], { replaceUrl: true });
  }

  changeSelection(coworker: any) {
    const index = this.selectedRecipients.findIndex(entity => entity._id === coworker._id);
    if (!coworker.selected) {
      this.selectedRecipients.splice(index, 1);
      const found = this.postShares.some(entity => {
        return entity.RecipientId === coworker._id;
      });
      if (found) {
        this.dataService
          .remove('/share/remove', found)
          .toPromise()
          .then(() => {});
      }
    } else {
      this.selectedRecipients.push(coworker);
    }
  }

  applyFilter(filterValue: string) {
    if (filterValue === null) {
      this.coworkerData.filter = '';
    } else {
      this.coworkerData = new MatTableDataSource(this.coworkers);
      this.coworkerData.filter = filterValue.trim().toLowerCase();
    }

    if (this.coworkerData.paginator) {
      this.coworkerData.paginator.firstPage();
    }
  }

  back() {
    this.navCntrl.navigateBack(['/post/details/', this.postId]);
  }

  private createForm() {
    this.shareForm = this.formBuilder.group({
      comment: ['', Validators.required],
      companies: ['', Validators.required]
    });
  }
}
