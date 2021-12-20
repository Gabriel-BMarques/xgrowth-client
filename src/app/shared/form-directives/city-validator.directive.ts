import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { ICity } from '../models/city.model';

@Directive({
  selector: '[appCityValidator]',
  providers: [{ provide: NG_VALIDATORS, useExisting: CityValidatorDirective, multi: true }]
})
export class CityValidatorDirective implements Validator {
  countries: ICity[] = [];

  constructor() {}

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value?._id) {
      return { cityInvalid: true };
    }
    return null;
  }
}
