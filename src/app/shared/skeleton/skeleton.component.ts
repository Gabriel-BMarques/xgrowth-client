import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss']
})
export class SkeletonComponent implements OnInit {
  @Input() skeleton: string;
  skeletonItems: number[];

  constructor() {}

  ngOnInit() {
    this.skeletonItems = [0, 1, 2, 3, 4];
  }
}
