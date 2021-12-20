import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MiscService {
  constructor(private http: HttpClient) {}

  listSomething(): Observable<any> {
    return this.http.get('/misc/something', { observe: 'response' });
  }
}
