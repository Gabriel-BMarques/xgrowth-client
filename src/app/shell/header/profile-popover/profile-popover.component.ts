import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserInfoService } from '@app/services/user-info.service';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-profile-popover',
  templateUrl: './profile-popover.component.html',
  styleUrls: ['./profile-popover.component.scss']
})
export class ProfilePopoverComponent implements OnInit {
  modalSections = [
    {
      title: 'organization',
      items: [
        {
          id: 'view-profile',
          label: 'view profile',
          icon: 'fas fa-sitemap',
          canSee: true,
          route: `/organization/${this.userInfoService.storedUserInfo.company.organization}/overview`,
          mode: 'view-profile'
        },
        {
          id: 'edit-profile',
          label: 'edit profile',
          icon: 'fas fa-pen',
          canSee: this.canEdit,
          route: `/organization/${this.userInfoService.storedUserInfo.company.organization}/edit`,
          mode: 'edit-org-profile'
        }
      ]
    },
    {
      title: 'user',
      items: [
        {
          id: 'edit-user-profile',
          label: 'edit user profile',
          icon: 'fas fa-user',
          canSee: true,
          route: `/organization/${this.userInfoService.storedUserInfo.company.organization}/edit`,
          mode: 'edit-user-profile'
        }
      ]
    }
  ];

  constructor(private userInfoService: UserInfoService, private router: Router, private popover: PopoverController) {}

  get canEdit(): boolean {
    return this.userInfoService.storedUserInfo.canEditOrganization;
  }

  ngOnInit(): void {}

  navigate(route: string, mode: string) {
    this.router.navigate([route], { replaceUrl: true, queryParams: { mode } }).then(() => this.popover.dismiss());
  }
}
