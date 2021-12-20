import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from '@app/services/data.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-webinar-denial',
  templateUrl: './modal-webinar-denial.component.html',
  styleUrls: ['./modal-webinar-denial.component.scss']
})
export class ModalWebinarDenialComponent implements OnInit {
  @Input() webinarId: string;
  isLoading: boolean = true;
  webinar: any;

  denialForm: FormGroup;

  constructor(
    private modalController: ModalController,
    private dataService: DataService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) {
    this.createForm();
  }

  async ngOnInit() {
    try {
      this.webinar = (await this.dataService.getPopulated('/webinar', this.webinarId).toPromise()).body;
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      const msg = `${error.status} ${error.statusText}`;
      this.snackBar.open(msg, '', {
        duration: 4000,
        panelClass: ['centered-snackbar']
      });
      setTimeout(() => {
        this.modalController.dismiss();
      }, 4000);
    }
  }

  async deny() {
    this.markFormGroupTouched(this.denialForm);
    if (this.denialForm.valid) {
      this.webinar.denialReason = this.messageField.value;
      await this.dataService.denyWebinar(this.webinar).toPromise();
      this.cancel();
    }
  }

  cancel() {
    this.modalController.dismiss();
  }

  markFormGroupTouched(formGroup: FormGroup) {
    (Object as any).values(formGroup.controls).forEach((control: FormGroup) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get messageField() {
    return this.denialForm.controls.message;
  }

  createForm() {
    this.denialForm = this.formBuilder.group({
      message: ['', Validators.required]
    });
  }
}
