import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MailService {
  constructor(private http: HttpClient) {}

  sendMessage(route: string, data: object): Observable<any> {
    return this.http.post(`/mail/${route}`, data, { observe: 'response' });
  }

  sendBriefDeclinedMail(email: string, brief: any, company: any) {
    const data = {
      email,
      briefTitle: brief.Title,
      companyName: company.companyName
    };
    this.sendMessage('brief-decline', data);
  }
}
