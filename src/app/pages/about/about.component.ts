import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { environment } from '@env/environment';
import { HeaderService } from '@app/services/header.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AboutComponent implements OnInit {
  header: string;
  version: string | null = environment.version;

  constructor(private headerService: HeaderService) {}

  ngOnInit() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'About';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Sobre';
    }
  }

  ionViewDidEnter() {
    this.headerService.setHeader(this.header);
  }
}
