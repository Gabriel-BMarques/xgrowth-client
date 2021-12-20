import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '@app/services/data.service';
import { ISkill, Skill } from '@app/shared/models/skill.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-job-title',
  templateUrl: './modal-job-title.component.html',
  styleUrls: ['./modal-job-title.component.scss']
})
export class ModalJobTitleComponent implements OnInit {
  // Receiving information
  @Input() jobTitle: any;

  newJobTitle: any;

  jobTitleForm!: FormGroup;
  isLoading = true;

  otherValues: string[] = [];

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) {
    this.createForms();
  }

  async ngOnInit() {
    if (this.jobTitle) {
      this.jobTitleForm.controls.name.setValue(this.jobTitle.name);
      this.jobTitleForm.controls.description.setValue(this.jobTitle.description);
      this.otherValues = this.jobTitle.otherValues;
      return;
    }
  }

  addValue() {
    if (this.otherValues.includes(this.jobTitleForm.controls.newOtherValue.value)) return;
    this.otherValues.push(this.jobTitleForm.controls.newOtherValue.value);
    this.jobTitleForm.controls.newOtherValue.reset();
  }

  deleteValue(item: string) {
    const index = this.otherValues.indexOf(item);
    if (index > -1 && index < this.otherValues.length + 1) {
      this.otherValues.splice(index, 1);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    (Object as any).values(formGroup.controls).forEach((control: FormGroup) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  async submit() {
    this.prepareDataToSubmit();
    this.markFormGroupTouched(this.jobTitleForm);
    if (this.jobTitleForm.valid) {
      if (!this.jobTitle) {
        await this.dataService.create('/misc/job-title', this.newJobTitle).toPromise();
      } else {
        await this.dataService.update('/misc/job-title', this.jobTitle).toPromise();
      }
      this.cancel();
    }
  }

  prepareDataToSubmit() {
    if (!this.jobTitle) {
      this.newJobTitle = {
        name: this.jobTitleForm.controls.name.value,
        description: this.jobTitleForm.controls.description.value,
        otherValues: this.otherValues
      };
      return;
    }

    this.jobTitle.name = this.jobTitleForm.controls.name.value;
    this.jobTitle.description = this.jobTitleForm.controls.description.value;
    this.jobTitle.otherValues = this.otherValues;
  }

  private createForms() {
    this.jobTitleForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      newOtherValue: ['']
    });
  }

  cancel() {
    this.modalController.dismiss();
  }

  get form() {
    return this.jobTitleForm.controls;
  }
}
