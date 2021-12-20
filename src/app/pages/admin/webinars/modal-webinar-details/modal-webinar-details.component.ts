import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from '@app/services/data.service';
import { AlertController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-webinar-details',
  templateUrl: './modal-webinar-details.component.html',
  styleUrls: ['./modal-webinar-details.component.scss']
})
export class ModalWebinarDetailsComponent implements OnInit {
  @Input() webinarId: string;
  isLoading: boolean = true;
  webinar: any;

  invitations: any[];

  constructor(
    private modalController: ModalController,
    private dataService: DataService,
    private snackBar: MatSnackBar,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    try {
      this.webinar = (await this.dataService.getPopulated('/webinar', this.webinarId).toPromise()).body;
      console.log(this.webinar, 'this webinar');
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      const msg = `${error.status} ${error.statusText}`;
      this.snackBar.open(msg, '', {
        duration: 4000,
        panelClass: ['centered-snackbar']
      });
    }
  }

  cancel() {
    this.modalController.dismiss();
  }
}
