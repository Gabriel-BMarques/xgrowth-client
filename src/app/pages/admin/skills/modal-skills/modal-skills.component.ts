import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '@app/services/data.service';
import { ISkill, Skill } from '@app/shared/models/skill.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-skills',
  templateUrl: './modal-skills.component.html',
  styleUrls: ['./modal-skills.component.scss']
})
export class ModalSkillsComponent implements OnInit {
  // Receiving information
  @Input() name: string;
  @Input() description: string;
  @Input() skill: any;

  responseInfoForm!: FormGroup;
  newSkill: ISkill;
  isLoading = true;
  selectedSegment: any;
  segmentsSI: any;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) {
    this.createForms();
  }

  async ngOnInit() {
    await this.dataService
      .listAll('/segments')
      .toPromise()
      .then(res => {
        this.segmentsSI = res.body;
      });

    if (this.skill) {
      this.responseInfoForm.controls.name.setValue(this.skill.name);
      this.responseInfoForm.controls.segment.setValue(this.skill.segment._id);
    }
  }

  isValid() {
    if (this.responseInfoForm.touched || this.responseInfoForm.invalid) {
      return false;
    } else {
      return true;
    }
  }

  submit() {
    // if contains a segment, update
    if (this.skill) {
      this.skill.name = this.form.name.value;
      this.skill.segment = this.form.segment.value;
      this.dataService
        .update('/skills', this.skill)
        .toPromise()
        .then(() => {
          this.skill.segment = this.form.segment.value;
          this.modalController.dismiss(this.skill);
        });
    } else {
      this.prepareDataToSubmit();
      this.dataService
        .create('/skills', this.newSkill)
        .toPromise()
        .then(res => {
          const skill = res.body;
          this.isLoading = false;
          this.modalController.dismiss(skill);
        });
    }
  }

  prepareDataToSubmit() {
    this.newSkill = new Skill();
    this.newSkill.name = this.form.name.value;
    this.newSkill.segment = this.form.segment.value;
  }

  private createForms() {
    this.responseInfoForm = this.formBuilder.group({
      name: ['', Validators.required],
      segment: ['aaaaa', Validators.required]
    });
  }

  cancel() {
    this.modalController.dismiss();
  }

  get form() {
    return this.responseInfoForm.controls;
  }
}
