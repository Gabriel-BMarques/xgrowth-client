import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MassDownloadService {
  private url = '/mass-download';

  constructor(private http: HttpClient) {}

  massDownload(collection: string): Observable<HttpEvent<any>> {
    const headers = new HttpHeaders();
    headers.append('ngsw-bypass', 'true');
    return this.http.get(`${this.url}/${collection}`, {
      observe: 'events',
      reportProgress: true,
      headers: headers,
      responseType: 'json'
    });
  }
}
