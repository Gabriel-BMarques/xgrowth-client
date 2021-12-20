import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { ICountry } from '../models/country.model';

@Directive({
  selector: '[appCountryValidator]',
  providers: [{ provide: NG_VALIDATORS, useExisting: CountryValidatorDirective, multi: true }]
})
export class CountryValidatorDirective implements Validator {
  countries: ICountry[] = [];

  constructor() {}

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value?._id) {
      return { countryInvalid: true };
    }
    return null;
  }
}
