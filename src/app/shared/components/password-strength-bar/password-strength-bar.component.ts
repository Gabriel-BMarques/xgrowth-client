import { Component, Input, OnInit, SimpleChange, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-password-strength-bar',
  templateUrl: './password-strength-bar.component.html',
  styleUrls: ['./password-strength-bar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PasswordStrengthBarComponent implements OnInit {
  @Input() public passwordToCheck: string;
  strength: Number = 0;
  currentColor: any;
  passwordStrength: any;

  private colors = ['warn', 'accent', 'accent', 'primary'];

  constructor() {}

  ngOnInit(): void {}

  checkStrength(password: any) {
    // Define Regex
    const minLetters = /^.{8,}$/.test(password);
    const lowerLetters = /[a-z]+/.test(password);
    const upperLetters = /[A-Z]+/.test(password);
    const numbers = /[0-9]+/.test(password);
    const regexSy = /[$-/:-?{-~!"^_@`\[\]]/g;
    const symbols = regexSy.test(password);

    // Define the criteria
    const criteria = [minLetters, lowerLetters, upperLetters, numbers, symbols];

    let existingCriteria = 0;

    // Increases 1 for each existing criterion
    for (const criterion of criteria) {
      criterion ? (existingCriteria += 1) : '';
    }

    let hasSequence = 0;
    // Check for sequential numerical characters
    for (var i in password) {
      if (+password[+i + 1] == +password[i] + 1 && +password[+i + 2] == +password[i] + 2) hasSequence = 1;
    }
    // Check for sequential alphabetical characters
    for (var i in password) {
      if (
        String.fromCharCode(password.charCodeAt(i) + 1) == password[+i + 1] &&
        String.fromCharCode(password.charCodeAt(i) + 2) == password[+i + 2]
      )
        hasSequence = 1;
    }

    if (hasSequence) {
      if (password.length < 8) this.strength = 20;
      else this.strength = 40;
    } else {
      // transform strength proportionally to 100
      this.strength = existingCriteria * (100 / criteria.length);
    }

    return this.strength;
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }): void {
    const password = changes.passwordToCheck.currentValue;

    if (password) {
      const strength = this.checkStrength(password);
      this.currentColor = this.colors[this.getColor(strength)];

      if (strength < 40) this.passwordStrength = 'Poor';
      else if (strength >= 40 && strength <= 80) this.passwordStrength = 'Average';
      else if (strength > 80) this.passwordStrength = 'Strong';
    }
  }

  private getColor(s: any) {
    let index = 0;

    if (s < 40) {
      index = 0;
    } else if (s <= 60) {
      index = 1;
    } else if (s <= 80) {
      index = 2;
    } else if (s <= 100) {
      index = 3;
    }

    return index;
  }
}
