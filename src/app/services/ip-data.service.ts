import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import * as $ from 'jquery';
import { HttpResponse, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IpDataService {
  private _ipURL: string = `https://api.ipdata.co/?api-key=${environment.ip_api_secret}`;
  private _isBlocked: boolean;

  constructor(private http: HttpClient) {}

  get ipURL(): string {
    return this._ipURL;
  }

  set isBlocked(value: boolean) {
    this._isBlocked = value;
  }

  get isBlocked(): boolean {
    return this._isBlocked;
  }

  get blockedCountries(): any[] {
    const blackList = [
      {
        country_code: 'DE',
        country_name: 'Germany'
      }
    ];
    return blackList;
  }

  getUserCountry(): Observable<any> {
    return this.http.get(`${this.ipURL}`, { observe: 'response' });
  }

  verifyCountryBlock() {
    $.get(this.ipURL, data => {
      this.isBlocked = this.blockedCountries.some(blockedCountry => {
        return blockedCountry.country_code === data.country_code;
      });
    });
  }

  /**
   * @public
   * @version version 1.0
   * @returns Client's ipv6 address
   *
   * With ipv6 address we can precisely identify client location
   * VPN will not affect global localization
   */
  async getIpv6Address() {
    const ip = await new Promise((resolve, reject) => {
      const conn = new RTCPeerConnection();
      conn.createDataChannel('');
      conn
        .createOffer()
        .then(offer => conn.setLocalDescription(offer))
        .catch(err => reject(err));
      conn.onicecandidate = ice => {
        if (ice && ice.candidate && ice.candidate.candidate) {
          resolve(ice.candidate.candidate.split(' ')[4]);
          conn.close();
        }
      };
    });
  }
}
