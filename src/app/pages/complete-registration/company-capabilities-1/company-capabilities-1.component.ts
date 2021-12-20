import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderService } from '@app/services/header.service';

@Component({
  selector: 'app-company-capabilities-1',
  templateUrl: './company-capabilities-1.component.html',
  styleUrls: ['./company-capabilities-1.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CompanyCapabilitiesComponent implements OnInit {
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

  back() {
    this.router.navigate(['complete-registration/company-info'], { replaceUrl: true });
  }

  next() {
    this.router.navigate(['complete-registration/company-capabilities-2'], { replaceUrl: true });
  }

  register() {
    // SOMETHING
  }

  private createForm() {
    this.registerForm = this.formBuilder.group({
      name: [''],
      selectedPlan: [''],
      accepted: false
    });
  }
}
