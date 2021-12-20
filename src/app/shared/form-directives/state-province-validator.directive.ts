import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { IStateProvince } from '../models/state-province.model';

@Directive({
  selector: '[appStateProvinceValidator]',
  providers: [{ provide: NG_VALIDATORS, useExisting: StateProvinceValidatorDirective, multi: true }]
})
export class StateProvinceValidatorDirective implements Validator {
  countries: IStateProvince[] = [];

  constructor() {}

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value?._id) {
      return { stateProvinceInvalid: true };
    }
    return null;
  }
}
