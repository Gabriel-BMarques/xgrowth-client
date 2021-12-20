import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import { IResponse, Response } from '@app/shared/models/response.model';
import { FormGroup, FormBuilder, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { IUploadedFile } from '@app/shared/models/uploadedFile.model';
import { ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { FilesService } from '@app/services/files.service';
import { MediaService } from '@app/services/media.service';
import * as timezones from '@app/shared/json-files/timezones.json';
import { IWebinar, Webinar } from '@app/shared/models/webinar.model';
import { IpDataService } from '@app/services/ip-data.service';
import { MatCalendar } from '@angular/material/datepicker';
import { ITutorial } from '@app/shared/models/tutorial.model';
import { TutorialDetailsComponent } from '@app/pages/tutorial/tutorial-details/tutorial-details.component';

@Component({
  selector: 'app-core-info',
  templateUrl: './core-info.component.html',
  styleUrls: ['./core-info.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CoreInfoComponent implements OnInit {
  isLoading: boolean = true;
  header: string;
  @ViewChild('fileInput')
  fileInput: FileUpload;
  isEditing: boolean = false;
  response: IResponse = new Response();
  images: string[] = [];
  imagesUrls: [];
  selectedImage: string;
  delImagesArray: string[] = [];
  file: IUploadedFile;
  files: any[] = [];
  loadingFiles = false;
  filesCopy: any[] = [];
  messageError: string;
  showInformations: boolean = false;

  //new vars
  coreInfoForm!: FormGroup;
  entity: IWebinar = {};
  webinarTypes: string[] = ['training', 'bootcamp', 'insights', 'promotion'];
  hasDismissedTutorial: boolean = false;
  tutorial: ITutorial;
  currentModal: any;
  validDate: boolean = true;

  // date vars
  confirm: boolean = true;
  selectedDate: any;
  timezoneOptions = timezones.default.sort((a: any, b: any) => {
    if (a.offset > b.offset) {
      return 1;
    }
    if (a.offset < b.offset) {
      return -1;
    }
    return 0;
  });
  datePeriodOptions: any[] = [
    { value: 'am', label: 'AM' },
    { value: 'pm', label: 'PM' }
  ];

  constructor(
    public modalController: ModalController,
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute,
    private fileService: FilesService,
    private mediaService: MediaService,
    private formBuilder: FormBuilder,
    private ipDataService: IpDataService
  ) {
    this.createForm();
  }

  @ViewChild('calendar', { static: false }) calendar: MatCalendar<Date>;

  createForm() {
    const defaultPeriod = this.datePeriodOptions[1].value;
    const defaultHour = 11;
    const defaultMinute = 59;
    const defaultTimezone = this.timezoneOptions[0];

    const reg = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

    this.coreInfoForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      uploadedFiles: [[], Validators.required],
      meetingLink: ['', Validators.required],
      type: ['', Validators.required],
      hour: [defaultHour],
      minute: [defaultMinute],
      dayperiod: [defaultPeriod],
      hourEnd: [defaultHour],
      minuteEnd: [defaultMinute],
      dayperiodEnd: [defaultPeriod],
      timezone: [defaultTimezone]
    });
  }

  async ngOnInit() {
    this.isLoading = true;
    if (this.route.snapshot.params.id && this.route.snapshot.params.id.length) {
      this.entity = (await this.dataService.find('/webinar', this.route.snapshot.params.id).toPromise()).body;
      this.isEditing = true;
      this.hasDismissedTutorial = true;
      const interval = setInterval(() => {
        if (this.calendar) {
          clearInterval(interval);
          this.calendar._goToDateInView(new Date(this.selectedDate), 'month');
        }
      }, 1000);
      this.prepareDataToEdit();
    } else {
      this.hasDismissedTutorial = false;
      try {
        this.tutorial = (
          await this.dataService.list('/tutorial', { topic: 'webinar', type: 'main topic', visible: true }).toPromise()
        ).body[0];
      } catch (err) {
        this.hasDismissedTutorial = true;
        console.log(err);
      }
      await this.setLocalTimeZone();
    }
    this.isLoading = false;
  }

  ngOnDestroy() {
    this.entity = undefined;
  }

  async openTutorial() {
    if (!this.tutorial) {
      this.tutorial = (
        await this.dataService.list('/tutorial', { topic: 'webinar', type: 'main topic', visible: true }).toPromise()
      ).body[0];
    }
    const modal = this.modalController.create({
      component: TutorialDetailsComponent,
      cssClass: 'tutorial-modal-class',
      componentProps: {
        tutorialInput: this.tutorial
      }
    });
    (await modal).present();
    this.currentModal = modal;
    (await modal).onDidDismiss();
  }

  // calendar methods begin

  fillTimeForm() {
    const { offset, text } = this.entity.eventTimezone;
    const eventDate = new Date(this.entity.eventDate);
    const minutes = eventDate.getUTCMinutes();
    const timezone = this.timezoneOptions.find((tz: any) => tz.text === text);
    let hours: number = eventDate.getUTCHours() + offset;
    const eventEndDate = new Date(this.entity.eventEndDate);
    const minutesEnd = eventEndDate.getUTCMinutes();
    let hoursEnd: number = eventEndDate.getUTCHours() + offset;

    if (hours < 0) hours += 24;
    else if (hours > 24) hours -= 24;

    if (hours > 12) {
      this.coreInfoForm.controls.dayperiod.setValue('pm');
      hours -= 12;
    } else this.coreInfoForm.controls.dayperiod.setValue('am');

    if (hoursEnd < 0) hoursEnd += 24;
    else if (hoursEnd > 24) hoursEnd -= 24;

    if (hoursEnd > 12) {
      this.coreInfoForm.controls.dayperiodEnd.setValue('pm');
      hoursEnd -= 12;
    } else this.coreInfoForm.controls.dayperiodEnd.setValue('am');

    this.coreInfoForm.controls.hour.setValue(hours);
    this.coreInfoForm.controls.minute.setValue(minutes);
    this.coreInfoForm.controls.hourEnd.setValue(hoursEnd);
    this.coreInfoForm.controls.minuteEnd.setValue(minutesEnd);
    this.coreInfoForm.controls.timezone.setValue(timezone);
  }

  async setLocalTimeZone() {
    try {
      const timezoneByLocation = (await this.ipDataService.getUserCountry().toPromise()).body.time_zone.name;
      const timezone = this.timezoneOptions.find((tz: any) => {
        return tz.utc.includes(timezoneByLocation);
      });
      if (timezone) {
        this.coreInfoForm.controls.timezone.setValue(timezone);
      }
    } catch (e) {
      console.log(e);
    }
  }

  onSelect(event: any) {
    this.selectedDate = event;
    return (this.confirm = false);
  }

  confirmDateSelection() {
    const date = this.getEventTime();
    const endDate = this.getEventEndTime();
    this.onSelect(date);
    this.entity.eventEndDate = endDate;
    this.entity.eventDate = date;
    this.entity.eventTimezone = {
      offset: this.eventTimezone.offset,
      text: this.eventTimezone.text
    };
  }

  formatHour(hourField: AbstractControl, dayPeriodField: AbstractControl) {
    if (hourField.value > 12 && hourField.value <= 24) {
      const formattedHour = hourField.value - 12;
      hourField.setValue(formattedHour);
      dayPeriodField.setValue('pm');
    } else if (hourField.value > 24) {
      hourField.setValue(12);
    } else if (hourField.value < 1) {
      hourField.setValue(1);
    }
  }

  formatMinute(minuteField: AbstractControl) {
    const formMinuteValue = minuteField.value;
    const maxOverflow = formMinuteValue > 59;
    const minOverflow = formMinuteValue < 0;
    if (maxOverflow) {
      minuteField.setValue(59);
    } else if (minOverflow) {
      minuteField.setValue(0);
    }
  }

  getEventTime(): any {
    const event = new Date(this.selectedDate);
    const timezoneOffset = this.eventTimezone.offset;
    let hour = this.eventHour;
    const minute = this.eventMinute;
    if (this.eventDayperiod === 'pm') hour += 12;
    hour -= timezoneOffset;
    event.setUTCHours(hour, minute, 59);
    return event;
  }

  getEventEndTime(): any {
    const eventEnd = new Date(this.selectedDate);
    const timezoneOffset = this.eventTimezone.offset;
    let hour = this.eventHourEnd;
    const minute = this.eventMinuteEnd;
    if (this.eventDayperiodEnd === 'pm') hour += 12;
    hour -= timezoneOffset;
    eventEnd.setUTCHours(hour, minute, 59);
    return eventEnd;
  }

  get eventHour() {
    return this.coreInfoForm.controls.hour.value;
  }

  get eventMinute() {
    return this.coreInfoForm.controls.minute.value;
  }

  get eventDayperiod() {
    return this.coreInfoForm.controls.dayperiod.value;
  }

  get eventHourEnd() {
    return this.coreInfoForm.controls.hourEnd.value;
  }

  get eventMinuteEnd() {
    return this.coreInfoForm.controls.minuteEnd.value;
  }

  get eventDayperiodEnd() {
    return this.coreInfoForm.controls.dayperiodEnd.value;
  }

  get eventTimezone() {
    return this.coreInfoForm.controls.timezone.value;
  }
  // calendar methods end

  isVideo(type: string) {
    const videoFormats = ['mp4', 'wmv', 'avi', 'mov'];
    if (videoFormats.includes(type)) {
      return true;
    } else {
      return false;
    }
  }

  getVideoThumbnail(url: string) {
    return this.mediaService.getVideoSource(url, 'thumbnail.png');
  }

  upload(event: any) {
    this.fileService.upload(event, this.files, this.fileInput, this.coreInfoForm.controls.uploadedFiles, 'image');
  }

  getThumbnailImage(url: string) {
    const image = 'https://weleverimages.blob.core.windows.net/app-images/' + url;
    return image;
  }

  getBlobName(url: string) {
    const blobName = url.split('https://weleverimages.blob.core.windows.net/app-images/').pop();
    return blobName;
  }

  fallbackImage(i: number) {
    if (this.response.UploadedFiles[i]) {
      this.response.UploadedFiles[i].url = 'https://picsum.photos/id/122/130/160';
      return this.response.UploadedFiles[i].url;
    }
  }

  deleteImageOfArray(request: any) {
    this.selectedImage = request;
    this.files.map((img, index: number = 0) => {
      if (this.selectedImage === img.url) {
        this.delImagesArray.push(this.getBlobName(img.url));
        this.files.splice(index, 1);
        this.coreInfoForm.controls.uploadedFiles.setValue(this.files);
      }
      index++;
    });
    this.deletePermanently();
  }

  doReorder(ev: any) {
    this.files = ev.detail.complete(this.files);
    this.coreInfoForm.controls.uploadedFiles.setValue(this.files);
  }

  delArraySize() {
    return this.delArraySize.length;
  }

  deletePermanently() {
    this.dataService
      .deleteFile('/upload', this.delImagesArray)
      .toPromise()
      .then((res: any) => {
        res.body.map((index: number = 0) => {
          res.body.push(this.delImagesArray[index]);
          index++;
        });
      });
  }

  prepareDataToSubmit() {
    if (!this.isEditing) this.entity = new Webinar();
    this.entity.title = this.coreInfoForm.controls.title.value;
    this.entity.description = this.coreInfoForm.controls.description.value;
    this.entity.uploadedFiles = this.coreInfoForm.controls.uploadedFiles.value;

    if (!this.coreInfoForm.controls.meetingLink.value.includes('http')) {
      const meetingLink =
        this.coreInfoForm.controls.meetingLink.value.slice(0, 0) +
        'http://' +
        this.coreInfoForm.controls.meetingLink.value.slice(0 + Math.abs(0));
      this.entity.meetingLink = meetingLink;
    } else this.entity.meetingLink = this.coreInfoForm.controls.meetingLink.value;
    this.entity.type = this.coreInfoForm.controls.type.value;
    this.confirmDateSelection();
  }

  prepareDataToEdit() {
    this.coreInfoForm.controls.title.setValue(this.entity.title);
    this.coreInfoForm.controls.description.setValue(this.entity.description);
    this.coreInfoForm.controls.uploadedFiles.setValue(this.entity.uploadedFiles);
    this.files = this.coreInfoForm.controls.uploadedFiles.value;
    this.coreInfoForm.controls.meetingLink.setValue(this.entity.meetingLink);
    this.coreInfoForm.controls.type.setValue(this.entity.type);
    this.selectedDate = this.entity.eventDate ? this.entity.eventDate : '';
    this.fillTimeForm();
  }

  markFormGroupTouched(formGroup: FormGroup) {
    (Object as any).values(formGroup.controls).forEach((control: FormGroup) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getFormValidationErrors(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const controlErrors: ValidationErrors = formGroup.get(key).errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
        });
      }
    });
  }

  checkDate(): boolean {
    const today = new Date();
    return !!this.selectedDate && new Date(this.selectedDate) > today && this.getEventEndTime() > this.getEventTime();
  }

  async next() {
    if (!this.hasDismissedTutorial) {
      this.hasDismissedTutorial = true;
      return;
    }
    const today = new Date();
    this.validDate = this.checkDate();
    this.markFormGroupTouched(this.coreInfoForm);
    if (this.coreInfoForm.valid && this.validDate) {
      this.prepareDataToSubmit();
      try {
        this.isLoading = true;
        if (this.isEditing) {
          this.entity.reviewStatus = 'pending';
          this.entity = (await this.dataService.update('/webinar', this.entity).toPromise()).body;
        } else {
          this.entity = (await this.dataService.create('/webinar', this.entity).toPromise()).body;
        }
        await this.router.navigate(['/webinars/target-users/edit', this.entity._id], { replaceUrl: true });
        this.isLoading = false;
      } catch (err) {
        console.log(err);
      }
    }
  }

  async cancel() {
    this.router.navigate(['/home'], { replaceUrl: true });
  }
}
