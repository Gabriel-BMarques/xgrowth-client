import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login-tabs',
  templateUrl: './login-tabs.component.html',
  styleUrls: ['./login-tabs.component.scss']
})
export class LoginTabsComponent implements OnInit {
  constructor(public router: Router, private route: ActivatedRoute) {}

  ngOnInit() {}

  registerSelected() {
    this.router.navigate(['/register'], { queryParams: {}, replaceUrl: true });
  }

  loginSelected() {
    this.router.navigate(['/login'], { queryParams: {}, replaceUrl: true });
  }
}
