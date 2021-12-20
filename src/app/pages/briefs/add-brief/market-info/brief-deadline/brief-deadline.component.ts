import { OnInit, Component, ViewChild, ViewEncapsulation, ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PanelData } from '@app/shared/models/panelData.model';
import { IItem, Item } from '@app/shared/models/item.model';
import { IonContent, AlertController } from '@ionic/angular';
import { MockService } from '@app/services/mock.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '@app/services/data.service';
import { TranslateService } from '@ngx-translate/core';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { NotificationService } from '@app/services/notification.service';
import { NavigationService } from '@app/services/navigation.service';
import { SelectItem } from 'primeng/api';
import * as timezones from '@app/shared/json-files/timezones.json';
import { IpDataService } from '@app/services/ip-data.service';

@Component({
  selector: 'app-brief-deadline',
  templateUrl: './brief-deadline.component.html',
  styleUrls: ['./brief-deadline.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BriefDeadlineComponent implements OnInit, IAlertControtllerGuard {
  skeletonLoading = true;
  isLoading = true;
  confirm = true;
  header: string;
  briefId: string;
  selectedDate: any;
  minDate: Date;
  name = 'Angular 6';
  invalidDateMessage: string;
  timeForm: FormGroup;
  datePeriodOptions: SelectItem[] = [
    { value: 'am', label: 'AM' },
    { value: 'pm', label: 'PM' }
  ];
  timezoneOptions = timezones.default.sort((a: any, b: any) => {
    if (a.offset > b.offset) {
      return 1;
    }
    if (a.offset < b.offset) {
      return -1;
    }
    return 0;
  });

  constructor(
    private headerService: HeaderService,
    private route: ActivatedRoute,
    private wizard: BriefAddWizardService,
    private router: Router,
    private dataService: DataService,
    public alertController: AlertController,
    public translate: TranslateService,
    private navigationService: NavigationService,
    private formBuilder: FormBuilder,
    private ipDataService: IpDataService
  ) {
    this.minDate = new Date();
    if (!this.wizard.isEditing) {
      this.invalidDateMessage = 'Deadline should be at least 3 weeks from current date';
      this.minDate.setDate(this.minDate.getDate() + 15);
    } else {
      this.invalidDateMessage = 'Date should be equal or greater than the current date';
    }
  }

  ngOnInit() {
    this.createForm();
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Categories';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Categorias';
    }
    this.skeletonLoading = true;
    setTimeout(() => {
      this.skeletonLoading = false;
    }, 2000);
  }

  ionViewWillEnter() {}

  async ionViewDidEnter() {
    this.headerService.setHeader(this.header);
    this.isLoading = false;
    this.wizard.entity._id
      ? (this.briefId = this.wizard.entity._id)
      : this.route.snapshot.params.id
      ? (this.briefId = this.route.snapshot.params.id)
      : (this.briefId = undefined);
    if (this.briefId && this.wizard.entity.Deadline) {
      this.selectedDate = this.wizard.entity.Deadline.toString();
      this.fillTimeForm();
    } else {
      try {
        const timezoneByLocation = (await this.ipDataService.getUserCountry().toPromise()).body.time_zone.name;
        const timezone = this.timezoneOptions.find((tz: any) => {
          return tz.utc.includes(timezoneByLocation);
        });
        if (timezone) {
          this.timeForm.controls.timezone.setValue(timezone);
        }
      } catch (e) {
        console.log(e);
      }
    }
    this.isLoading = false;
  }

  fillTimeForm() {
    const { offset, text } = this.wizard.entity.DeadlineTimezone;
    const deadline = new Date(this.wizard.entity.Deadline);
    const minutes = deadline.getUTCMinutes();
    const timezone = this.timezoneOptions.find((tz: any) => tz.text === text);
    let hours: number = deadline.getUTCHours() - offset;

    if (hours < 0) {
      hours += 24;
    } else if (hours > 24) {
      hours -= 24;
    }

    // converting to ampm
    if (hours > 12) {
      this.timeForm.controls.dayperiod.setValue('pm');
      hours -= 12;
    } else {
      this.timeForm.controls.dayperiod.setValue('am');
    }

    this.timeForm.controls.hour.setValue(hours);
    this.timeForm.controls.minute.setValue(minutes);
    this.timeForm.controls.timezone.setValue(timezone);
  }

  onSelect(event: any) {
    if (event < this.minDate) {
      this.presentAlert();
      return (this.confirm = true);
    } else {
      this.selectedDate = event;
      return (this.confirm = false);
    }
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      cssClass: 'alertDate-class',
      header: this.translate.instant('briefs.add.invalidDate'),
      subHeader: '',
      message: this.translate.instant(this.invalidDateMessage),
      buttons: ['OK']
    });

    await alert.present();
  }

  confirmSelection() {
    const date = this.getDeadlineTime();
    this.onSelect(date);
    this.wizard.entity.Deadline = date;
    this.wizard.entity.DeadlineTimezone = {
      offset: this.deadlineTimezone.offset,
      text: this.deadlineTimezone.text
    };
    this.dataService
      .update('/brief', this.wizard.entity)
      .toPromise()
      .then(() => {});
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/market-info'], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/market-info/edit', this.wizard.entity._id], { replaceUrl: true });
    }
  }

  getDeadlineTime(): any {
    const deadline = new Date(this.selectedDate);
    const timezoneOffset = this.deadlineTimezone.offset;
    let hour = this.deadlineHour;
    const minute = this.deadlineMinute;
    if (this.deadlineDayperiod === 'pm') hour += 12;
    hour += timezoneOffset;
    deadline.setUTCHours(hour, minute, 59);
    return deadline;
  }

  back() {
    this.router.navigate(['/briefs/add-brief/market-info'], { replaceUrl: true });
  }

  formatHour() {
    const formHourValue = this.timeForm.controls.hour.value;
    const is24Format = formHourValue > 12 && formHourValue <= 24;
    const maxOverflow = formHourValue > 24;
    const minOverflow = formHourValue < 1;
    if (is24Format) {
      const formattedHour = formHourValue - 12;
      this.timeForm.controls.hour.setValue(formattedHour);
      this.timeForm.controls.dayperiod.setValue('pm');
    } else if (maxOverflow) {
      this.timeForm.controls.hour.setValue(12);
    } else if (minOverflow) {
      this.timeForm.controls.hour.setValue(1);
    }
  }

  formatMinute() {
    const formMinuteValue = this.timeForm.controls.minute.value;
    const maxOverflow = formMinuteValue > 59;
    const minOverflow = formMinuteValue < 0;
    if (maxOverflow) {
      this.timeForm.controls.minute.setValue(59);
    } else if (minOverflow) {
      this.timeForm.controls.minute.setValue(0);
    }
  }

  createForm() {
    const defaultPeriod = this.datePeriodOptions[1].value;
    const defaultHour = 11;
    const defaultMinute = 59;
    const defaultTimezone = this.timezoneOptions[0];
    this.timeForm = this.formBuilder.group({
      hour: [defaultHour, Validators.required],
      minute: [defaultMinute, Validators.required],
      dayperiod: [defaultPeriod, Validators.required],
      timezone: [defaultTimezone, Validators.required]
    });
  }

  canDeactivate() {
    if (this.wizard.isEditing) {
      return this.navigationService.generateAlertBrief(
        'Discard Brief?',
        'If you leave the brief edition now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    } else {
      return this.navigationService.generateAlertBrief(
        'Discard Brief?',
        'If you leave the brief creation now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    }
  }

  get deadlineHour() {
    return this.timeForm.controls.hour.value;
  }

  get deadlineMinute() {
    return this.timeForm.controls.minute.value;
  }

  get deadlineDayperiod() {
    return this.timeForm.controls.dayperiod.value;
  }

  get deadlineTimezone() {
    return this.timeForm.controls.timezone.value;
  }
}
