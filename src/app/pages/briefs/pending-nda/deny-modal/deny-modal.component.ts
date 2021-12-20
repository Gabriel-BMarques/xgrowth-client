import { Component, OnInit, OnDestroy } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { IItem } from '@app/shared/models/item.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '@app/services/data.service';
import { Notification } from '@app/shared/models/notification.model';
import { MailService } from '@app/services/mail.service';
import { environment } from '@env/environment';
import { NotificationService } from '@app/services/notification.service';

@Component({
  selector: 'app-deny-modal',
  templateUrl: './deny-modal.component.html',
  styleUrls: ['./deny-modal.component.scss']
})
export class DenyModalComponent implements OnInit, OnDestroy {
  arrayDenied: any[] = [];
  placeholder: string;
  // itemSelected: IItem;
  itemSelected: any;
  ndaAcceptanceForm: FormGroup;

  constructor(
    public popover: PopoverController,
    private navParams: NavParams,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private mailService: MailService,
    private notificationService: NotificationService
  ) {
    this.createForm();
    this.arrayDenied = this.navParams.get('array');
    this.itemSelected = this.navParams.get('selected');
  }

  ngOnInit() {
    if (localStorage.getItem('language') === 'en-US') {
      this.placeholder = 'Describe with as much details as possible';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.placeholder = 'Descreva com o maior detalhamento possível';
    }
  }

  ngOnDestroy() {}

  cancel() {
    this.popover.dismiss();
  }

  send() {
    this.itemSelected.NdaAcceptance = 2;
    this.itemSelected.NdaAcceptanceReason = this.ndaAcceptanceForm.controls.description.value;
    this.notificationService.sendBriefNDADeclineNotification(this.itemSelected);
    this.dataService
      .update('/brief-supplier', this.itemSelected)
      .toPromise()
      .then(res => {
        this.arrayDenied.push(res.body);
      });
    this.popover.dismiss();
  }

  createForm() {
    this.ndaAcceptanceForm = this.formBuilder.group({
      description: ['', Validators.required]
    });
  }
}
