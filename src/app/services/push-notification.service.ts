import { Injectable } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { Push, PushObject, PushOptions } from '@ionic-native/push/ngx';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

type EntityResponseType = HttpResponse<any>;

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  REGISTRATION_ID_KEY: string = 'registrationId';

  constructor(
    private platform: Platform,
    private push: Push,
    private http: HttpClient,
    private toastCtrl: ToastController
  ) {}

  async init() {
    if (this.isNative()) {
      this.push.hasPermission().then((res: any) => {
        if (res.isEnabled) {
          this.register();
        }
      });
    }
  }

  private register() {
    const options: PushOptions = {
      android: {},
      ios: {
        alert: 'true',
        badge: true,
        sound: 'true'
      }
    };

    const pushObject: PushObject = this.push.init(options);

    pushObject.on('notification').subscribe(async (notification: any) => {
      const toast = await this.toastCtrl.create({
        header: notification.title,
        message: notification.message,
        position: 'bottom',
        duration: 3000
      });
      toast.present();
    });

    pushObject.on('registration').subscribe(async (registration: any) => {
      let oldRegId = localStorage.getItem(this.REGISTRATION_ID_KEY);

      if (!oldRegId || oldRegId !== registration.registrationId) {
        localStorage.setItem(this.REGISTRATION_ID_KEY, registration.registrationId);

        const installation = {
          installationId: '',
          pushChannel: registration.registrationId,
          tags: [registration.registrationId],
          registrationType: registration.registrationType
        };

        await this.registerDevice(installation)
          .toPromise()
          .then(res => {});
      }
    });

    pushObject.on('error').subscribe(error => {
      console.error('Error with Push plugin', error);
    });
  }

  private registerDevice(registration: any): Observable<EntityResponseType> {
    return this.http.post('/notification-device', registration, { observe: 'response' });
  }

  private isNative(): boolean {
    return this.platform.is('cordova');
  }
}
