import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '@app/services/data.service';
import { ISkill, Skill } from '@app/shared/models/skill.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-departments',
  templateUrl: './modal-departments.component.html',
  styleUrls: ['./modal-departments.component.scss']
})
export class ModalDepartmentsComponent implements OnInit {
  // Receiving information
  @Input() department: any;

  newDepartment: any;

  departmentForm!: FormGroup;
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
    if (this.department) {
      this.departmentForm.controls.name.setValue(this.department.name);
      this.departmentForm.controls.description.setValue(this.department.description);
      this.otherValues = this.department.otherValues;
      return;
    }
  }

  addValue() {
    if (this.otherValues.includes(this.departmentForm.controls.newOtherValue.value)) return;
    this.otherValues.push(this.departmentForm.controls.newOtherValue.value);
    this.departmentForm.controls.newOtherValue.reset();
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
    this.markFormGroupTouched(this.departmentForm);

    if (this.departmentForm.valid) {
      if (!this.department) {
        await this.dataService.create('/misc/department', this.newDepartment).toPromise();
      } else {
        await this.dataService.update('/misc/department', this.department).toPromise();
      }
      this.cancel();
    }
  }

  prepareDataToSubmit() {
    if (!this.department) {
      this.newDepartment = {
        name: this.departmentForm.controls.name.value,
        description: this.departmentForm.controls.description.value,
        otherValues: this.otherValues
      };
      return;
    }

    this.department.name = this.departmentForm.controls.name.value;
    this.department.description = this.departmentForm.controls.description.value;
    this.department.otherValues = this.otherValues;
  }

  private createForms() {
    this.departmentForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      newOtherValue: ['']
    });
  }

  cancel() {
    this.modalController.dismiss();
  }

  get form() {
    return this.departmentForm.controls;
  }
}
