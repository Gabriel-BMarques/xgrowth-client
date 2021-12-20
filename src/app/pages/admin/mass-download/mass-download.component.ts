import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MassDownloadService } from '@app/services/mass-download.service';
import { AlertController } from '@ionic/angular';
import { saveAs } from 'file-saver';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-mass-download',
  templateUrl: './mass-download.component.html',
  styleUrls: ['./mass-download.component.scss']
})
export class MassDownloadComponent implements OnInit {
  downloadStarted: boolean = false;
  progressBarValue: number = 0;
  progressBarBuffer: number = 0;
  step: number = 0;

  constructor(private massDownloadService: MassDownloadService, private alertController: AlertController) {}

  ngOnInit(): void {}

  clearDownload() {
    this.downloadStarted = false;
    this.progressBarValue = 0;
    this.progressBarBuffer = 0;
    this.step = 0;
  }

  downloadFile(collection: string) {
    this.downloadStarted = true;
    this.massDownloadService
      .massDownload(collection)
      .pipe(
        catchError(async err => {
          let header: string;
          let subHeader: string;
          let message: string;
          if (localStorage.getItem('language') === 'en-US') {
            header = 'Download failed!';
            subHeader = 'An error occurred while mass downloading and it cannot be completed.';
            message = 'If the errors persists, please contact the support.';
          } else if (localStorage.getItem('language') === 'pt-BR') {
            header = 'Falha ao baixar arquivo!';
            subHeader = 'Ocorreu um erro durante o mass download e o mesmo não pode ser concluído.';
            message = 'Se o erro persistir, por favor contate o suporte.';
          }
          // database failure
          const errorAlert = await this.alertController.create({
            header: header,
            subHeader: subHeader,
            message: message,
            buttons: ['OK']
          });
          this.clearDownload();
          await errorAlert.present();
          throw err;
        }),
        tap((res: any) => {
          // save file
          if (res?.body) {
            const { buffer, fileName } = res.body;
            saveAs(
              new Blob([new Uint8Array(buffer.data)], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              }),
              fileName
            );
          }
        })
      )
      .subscribe(
        (event: HttpEvent<any>) => {
          console.log(event);
          switch (event.type) {
            case HttpEventType.DownloadProgress:
              this.progressBarValue = Math.round(event.loaded / event.loaded) - 0.5;
              this.progressBarBuffer = 2 * this.progressBarValue;
              this.step = Math.floor(this.progressBarValue / 0.5);
              console.log('download', this.progressBarValue, this.progressBarBuffer, this.step);
              break;
            case HttpEventType.Response:
              this.progressBarBuffer = this.progressBarValue = 1;
              this.step = 2;
              console.log('done', this.progressBarValue, this.progressBarBuffer, this.step);
              break;
          }
        },
        err => console.log(err)
      );
  }
}
