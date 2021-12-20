import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-image-resize',
  templateUrl: './modal-image-resize.component.html',
  styleUrls: ['./modal-image-resize.component.scss']
})
export class ModalImageResize implements OnInit {
  @Input() imgElement: any;

  resizeForm: FormGroup;

  widthSubscription: Subscription;

  constructor(private modalController: ModalController, private formBuilder: FormBuilder) {
    this.createForms();
  }

  async ngOnInit() {
    this.resizeForm.controls.width.setValue(this.imgElement.width);
    this.resizeForm.controls.height.setValue(this.imgElement.height);

    const initialWidth = this.imgElement.width;
    const initialHeight = this.imgElement.height;

    this.widthSubscription = this.resizeForm.controls.width.valueChanges.subscribe(value => {
      this.imgElement.width = value;
      const height = (value / initialWidth) * initialHeight;
      this.imgElement.height = height;
      this.resizeForm.controls.height.setValue(this.imgElement.height);
    });
  }

  ngOnDestroy() {
    // unsubscribe from all observables to avoid memory leaks
    this.widthSubscription.unsubscribe();
  }

  private createForms() {
    this.resizeForm = this.formBuilder.group({
      width: [''],
      height: ['']
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
