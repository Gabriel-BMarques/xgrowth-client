import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MassUploadService } from '@app/services/mass-upload.service';
import { AlertController } from '@ionic/angular';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-mass-upload',
  templateUrl: './mass-upload.component.html',
  styleUrls: ['./mass-upload.component.scss']
})
export class MassUploadComponent implements OnInit {
  file: any;
  fileSize: string;
  uploadStarted: boolean = false;
  step: number = 0;
  progressBarValue: number = 0;
  progressBarBuffer: number = 0;
  formData: FormData;

  constructor(private massUploadService: MassUploadService, private alertController: AlertController) {}

  ngOnInit(): void {}

  uploadFile(event: any) {
    const [file] = event.files;
    this.file = file;
    this.fileSize = `${(file.size / 1000).toFixed(2)} KB`;
    this.formData = new FormData();
    this.formData.append('file', file);
  }

  clearUpload() {
    this.file = undefined;
    this.fileSize = undefined;
    this.uploadStarted = false;
    this.step = 0;
    this.progressBarBuffer = 0;
    this.progressBarValue = 0;
  }

  startMassUpload() {
    this.massUploadService
      .massUpload(this.formData)
      .pipe(
        catchError(async err => {
          let header: string;
          let subHeader: string;
          const message: string = JSON.parse(err.error.message)[localStorage.getItem('language')];
          if (localStorage.getItem('language') === 'en-US') {
            header = 'Upload failed!';
            subHeader = 'An error occurred while mass uploading and it cannot be completed.';
          } else if (localStorage.getItem('language') === 'pt-BR') {
            header = 'Falha no envio!';
            subHeader = 'Ocorreu um erro durante o mass upload e o mesmo não pode ser concluído.';
          }
          const errorAlert = await this.alertController.create({
            header: header,
            subHeader: subHeader,
            message: message,
            buttons: ['OK']
          });
          this.clearUpload();
          await errorAlert.present();
          throw err;
        }),
        tap(_ => (this.uploadStarted = true))
      )
      .subscribe(
        (event: HttpEvent<any>) => {
          console.log(event);
          switch (event.type) {
            case HttpEventType.UploadProgress:
              this.progressBarValue = Math.round(event.loaded / event.total) - 0.5;
              this.progressBarBuffer = 2 * this.progressBarValue;
              this.step = Math.floor(this.progressBarValue / 0.5);
              console.log('upload', this.progressBarValue, this.progressBarValue, this.step);
              break;
            case HttpEventType.Response:
              this.progressBarBuffer = this.progressBarValue = 1;
              this.step = 2;
              console.log('done', this.progressBarValue, this.progressBarValue, this.step);
              break;
          }
        },
        err => console.log(err)
      );
  }
}
