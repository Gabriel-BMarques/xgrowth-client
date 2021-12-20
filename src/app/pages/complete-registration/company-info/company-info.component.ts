import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderService } from '@app/services/header.service';

@Component({
  selector: 'app-company-info',
  templateUrl: './company-info.component.html',
  styleUrls: ['./company-info.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CompanyInfoComponent implements OnInit {
  header: string;
  registerForm!: FormGroup;
  isLoading = true;
  toppings = new FormControl();
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];

  constructor(private formBuilder: FormBuilder, private router: Router, private headerService: HeaderService) {
    this.createForm();
  }

  ngOnInit() {
    this.header = 'Complete Your Registration';
  }

  ionViewDidEnter() {
    this.headerService.setHeader(this.header);
    this.isLoading = false;
  }

  register() {
    // SOMETHING
  }

  back() {
    this.router.navigate(['complete-registration/personal-info'], { replaceUrl: true });
  }

  next() {
    this.router.navigate(['complete-registration/company-capabilities-1'], { replaceUrl: true });
  }

  private createForm() {
    this.registerForm = this.formBuilder.group({
      name: [''],
      selectedPlan: [''],
      accepted: false
    });
  }
}
