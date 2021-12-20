import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { IWebinar } from '@app/shared/models/webinar.model';

@Component({
  selector: 'app-modal-submit',
  templateUrl: './modal-submit.component.html',
  styleUrls: ['./modal-submit.component.scss']
})
export class ModalSubmit implements OnInit {
  @Input() webinar: IWebinar;
  constructor(public modalController: ModalController, private dataService: DataService, private router: Router) {}

  async ngOnInit() {}

  async submit() {
    try {
      if (!!this.webinar.isPublished) {
        this.webinar = (await this.dataService.update('/webinar', this.webinar).toPromise()).body;
        await this.dataService.createWebinarInvitations(this.webinar).toPromise();
      } else {
        this.webinar = (await this.dataService.publishWebinar(this.webinar).toPromise()).body;
        await this.dataService.createWebinarInvitations(this.webinar).toPromise();
      }
    } catch (err) {
      console.log(err);
    }
    this.router.navigate(['/webinars'], { replaceUrl: true });
    this.modalController.dismiss();
  }
}
