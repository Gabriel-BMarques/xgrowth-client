import { Component, OnInit, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { IWebinar } from '@app/shared/models/webinar.model';
import { AlertController, ModalController } from '@ionic/angular';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-modal-guest-list',
  templateUrl: './modal-guest-list.component.html',
  styleUrls: ['./modal-guest-list.component.scss']
})
export class ModalGuestListComponent implements OnInit {
  @Input() webinarId: string;
  isLoading: boolean = true;
  webinar: IWebinar;

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
      await this.listInvitations();
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

  downloadGuestsXlsx() {
    const fileName = `guests.xlsx`;
    const fileLines: any = [];

    this.invitations.forEach(invite => {
      const formattedLine = {
        'e-mail': invite.invitedUserId.email || '',
        BU: invite.invitedUserId.company.companyName || '',
        Organization: invite.invitedUserId.company.organization.name || '',
        'Job Title': invite.invitedUserId.jobTitle || '',
        Department: invite.invitedUserId.department || ''
      };
      fileLines.push(formattedLine);
    });
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(fileLines);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, fileName);
    XLSX.writeFile(wb, fileName);
  }

  async listInvitations() {
    this.invitations = (
      await this.dataService.listPopulated('/webinar-invitation', { webinarId: this.webinar._id }).toPromise()
    ).body;
  }

  async cancelInvitation(invitation: any) {
    this.alertController
      .create({
        cssClass: 'alertConfirmation',
        header: 'Are you sure?',
        message: "this will remove this user's invitation",
        buttons: [
          {
            text: 'confirm',
            cssClass: 'confirmation-discardButton',
            handler: async () => {
              await this.dataService.remove('/webinar-invitation', invitation).toPromise();
              invitation.status = 'uninvited';
            }
          },
          {
            text: 'cancel',
            cssClass: 'confirmation-cancelButton',
            role: 'cancel'
          }
        ]
      })
      .then(alert => {
        alert.present();
      });
  }

  async recreateInvitation(invitation: any) {
    this.alertController
      .create({
        cssClass: 'alertConfirmation',
        header: 'Are you sure?',
        message: 'this will reinvite this user',
        buttons: [
          {
            text: 'confirm',
            cssClass: 'confirmation-discardButton',
            handler: async () => {
              if (this.webinar && this.webinar.reviewStatus === 'pending') {
                invitation.status = 'pending approval';
              } else {
                invitation.status = 'invited';
              }
              invitation = await this.dataService.create('/webinar-invitation', invitation).toPromise();
            }
          },
          {
            text: 'cancel',
            cssClass: 'confirmation-cancelButton',
            role: 'cancel'
          }
        ]
      })
      .then(alert => {
        alert.present();
      });
  }

  cancel() {
    this.modalController.dismiss();
  }
}
