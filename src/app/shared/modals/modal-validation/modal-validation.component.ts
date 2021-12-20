import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-modal-validation',
  templateUrl: './modal-validation.component.html',
  styleUrls: ['./modal-validation.component.scss']
})
export class ModalValidationComponent implements OnInit {
  @Input() title: string;
  @Input() mainMessage: string;
  @Input() secondaryMessage: string;
  @Input() textButton: string;

  constructor(private popoverController: PopoverController) {}

  ngOnInit(): void {}

  ok() {
    const status = true;
    this.popoverController.dismiss(status);
  }
}
