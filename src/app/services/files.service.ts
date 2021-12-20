import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { FileUpload } from 'primeng/fileupload';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  constructor(private dataService: DataService) {}
  isUploadingFile: boolean = false;

  getThumbnailImage(uploadResponse: any) {
    const image = 'https://weleverimages.blob.core.windows.net/app-images/' + uploadResponse;
    return image;
  }

  async download(fileUrl: string, fileName: string) {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = fileUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(fileUrl);
  }

  async uploadOne(event: any, fileInput: FileUpload) {
    this.isUploadingFile = true;
    const hasFile = event.files.length;
    let entityFile: any;
    if (hasFile) {
      const file = event.files[0];
      console.log(fileInput, 'fileInput');
      let formData = new FormData();
      formData.append('file', file);

      entityFile = {
        Name: file.name,
        Size: file.size,
        Type: file.type
          .split('/')
          .pop()
          .toLowerCase()
      };

      await this.dataService
        .upload('/upload', formData)
        .toPromise()
        .then(res => {
          console.log(res, 'res');
          entityFile.url = this.getThumbnailImage(res.body.blob).toString();
          this.isUploadingFile = false;
        });
    }
    fileInput.clear();
    return entityFile;
  }

  upload(event: any, files: any[], fileInput: any, formControl?: AbstractControl, mode?: string) {
    const fileCount: number = event.files.length;
    let formData;
    if (fileCount > 0) {
      event.files.map((file: any) => {
        formData = new FormData();
        formData.append('file', file);

        files.push({
          Name: file.name,
          Size: file.size,
          Type: file.type
            .split('/')
            .pop()
            .toLowerCase()
        });

        const index = files.length - 1;

        this.dataService
          .upload('/upload', formData)
          .toPromise()
          .then(res => {
            files[index].url = this.getThumbnailImage(res.body.blob).toString();
            formControl?.setValue(files);
          });

        fileInput.clear();
      });
    }
  }

  async uploadEditor(file: any) {
    const formData = new FormData();
    formData.append('file', file);

    return await this.dataService.upload('/upload/editor', formData).toPromise();
  }
}
