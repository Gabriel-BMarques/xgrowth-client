import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'briefDate',
  pure: true
})
export class BriefDatePipe implements PipeTransform {
  transform(date: string, args: string[]): string {
    if (!date) return '';

    // 2021-05-25T17:02:00.690Z  to "Wed, Mar 17 2021 - 11"59 AM,
    const monthsName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const daysNameAbb = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get Day Name
    let fullDate = date.slice(0, 10);
    let auxDate = new Date(fullDate);
    let dayName = daysNameAbb[auxDate.getDay() + 1];

    // Get AM PM
    let ampmSwitch = parseInt(date.slice(11, 13)) > 12 ? 'PM' : 'AM';

    // Get hour
    let hour = date.slice(11, 16);

    // Get month,day and year
    let datejs = new Date(date);

    let monthName = monthsName[datejs.getMonth()];
    let day = datejs.getDate();
    let year = datejs.getFullYear();

    return dayName + ', ' + monthName + ' ' + day + ' ' + year + ' - ' + hour + ' ' + ampmSwitch;
  }
}
