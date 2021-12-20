import { FormGroup } from '@angular/forms';

// custom validator to check that two fields match
export function PasswordStrength(controlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];

    const regex = new RegExp('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$');
    const test = regex.test(control.value);

    if (!test) {
      control.setErrors({ strength: true });
    } else {
      control.setErrors(null);
    }
  };
}
