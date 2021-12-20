import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { LoadingController, Events, ModalController } from '@ionic/angular';
import { CredentialsService } from '@app/core/authentication/credentials.service';
import { UserInfoService } from '@app/services/user-info.service';
import { HttpResponse } from '@angular/common/http';
import { IWebinar } from '@app/shared/models/webinar.model';

@Component({
  selector: 'app-modal-webinar-review',
  templateUrl: './modal-webinar-review.component.html',
  styleUrls: ['./modal-webinar-review.component.scss']
})
export class ModalWebinarReview implements OnInit {
  @Input() webinar: IWebinar;
  constructor(
    private loadingController: LoadingController,
    private userInfoService: UserInfoService,
    public modalController: ModalController
  ) {}

  async ngOnInit() {}
}
