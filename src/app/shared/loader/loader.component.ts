import { Component, OnInit, Input } from '@angular/core';
import { IPanelData } from '../models/panelData.model';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {
  @Input() isLoading = true;
  @Input() message: string | undefined;
  @Input() panelData: IPanelData;

  constructor() {}

  ngOnInit() {}
}
