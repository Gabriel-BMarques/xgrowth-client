import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-overview-modal',
  templateUrl: './overview-modal.component.html',
  styleUrls: ['./overview-modal.component.scss']
})
export class OverviewModalComponent implements OnInit {
  @Input() organizationType: string;
  @Input() segments: string;
  @Input() subSegments: string;
  @Input() skills: string;
  @Input() certifications: string;
  @Input() initiatives: string;

  constructor() {}

  ngOnInit(): void {}
}
