import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from '@app/services/header.service';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TabsComponent implements OnInit {
  constructor(
    private router: Router,
    private navigationService: NavigationService,
    private headerService: HeaderService
  ) {}

  async ngOnInit() {}

  async navigationToll(title?: string) {
    const currentPath = window.location.hash;
    this.navigationService.clearWizardData(currentPath);
  }

  get tabBar() {
    const currentPath = window.location.hash;
    const status = this.navigationService.changeTabBarDisplay(currentPath);
    return status;
  }
}
