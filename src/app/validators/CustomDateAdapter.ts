import { NativeDateAdapter } from '@angular/material/core';
import { Injectable } from '@angular/core';
import * as moment from 'moment';

// Changes date type validation format to DD/MM/YYYY
@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  useUtcForDisplay = true;

  format(date: Date): string {
    return moment(date).format('DD/MM/YYYY');
  }

  parse(value: any): Date | null {
    if (value && typeof value === 'string') {
      value = value.replace('_', '');
    }

    if (!moment(value, 'DD/MM/YYYY', true).isValid()) {
      return this.invalid();
    }

    return moment(value, 'DD/MM/YYYY', true).toDate();
  }
}
