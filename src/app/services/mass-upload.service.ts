import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MassUploadService {
  private url = 'mass-upload';

  constructor(private http: HttpClient) {}

  massUpload(formData: FormData): Observable<HttpEvent<any>> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('ngsw-bypass', 'true');

    return this.http.post(`/${this.url}`, formData, {
      observe: 'events',
      reportProgress: true,
      headers: headers,
      responseType: 'json'
    });
  }
}
