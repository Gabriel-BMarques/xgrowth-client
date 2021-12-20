import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '@app/services/data.service';
import { ModalController } from '@ionic/angular';
import { ISegment, Segment } from '../../../../shared/models/segment.model';

@Component({
  selector: 'app-modal-segments',
  templateUrl: './modal-segments.component.html',
  styleUrls: ['./modal-segments.component.scss']
})
export class ModalSegmentsComponent implements OnInit {
  // Receiving information
  @Input() name: string;
  @Input() description: string;
  @Input() segment: any;

  newCategory: ISegment;
  responseInfoForm!: FormGroup;
  newSegment: ISegment;
  isLoading = true;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) {
    this.createForms();
  }

  ngOnInit() {
    if (this.segment) {
      this.responseInfoForm.controls.name.setValue(this.segment.name);
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
    if (this.segment) {
      this.segment.name = this.form.name.value;
      this.dataService
        .update('/segments', this.segment)
        .toPromise()
        .then(res => {
          const segment = res.body;
          this.modalController.dismiss();
        });
    } else {
      this.prepareDataToSubmit();
      this.dataService
        .create('/segments', this.newSegment)
        .toPromise()
        .then(res => {
          const segment = res.body;
          this.isLoading = false;
          this.modalController.dismiss(segment);
        });
    }
  }

  prepareDataToSubmit() {
    this.newSegment = new Segment();
    this.newSegment.name = this.form.name.value;
    this.newSegment.description = '';
  }

  private createForms() {
    this.responseInfoForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  cancel() {
    this.modalController.dismiss();
  }

  get form() {
    return this.responseInfoForm.controls;
  }
}
