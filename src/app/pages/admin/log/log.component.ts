import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { PanelData } from '@app/shared/models/panelData.model';
import { MockService } from '@app/services/mock.service';

@Component({
  selector: 'app-admin-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdminLogComponent implements OnInit {
  header: string;
  isLoading = false;
  panelData: PanelData;

  constructor(private headerService: HeaderService, private mockService: MockService) {}

  ngOnInit() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Admin Log';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Admin Log';
    }
  }

  ionViewWillEnter() {
    this.panelData = this.mockService.generatePosts();
  }

  ionViewDidEnter() {
    this.headerService.setHeader(this.header);
    this.isLoading = true;
  }
}
