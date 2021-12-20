import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { FilesService } from '@app/services/files.service';
import { ITutorial, Tutorial } from '@app/shared/models/tutorial.model';
import { ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { ModalImageResize } from '../modal-image-resize/modal-image-resize.component';

@Component({
  selector: 'app-tutorial-edit',
  templateUrl: './tutorial-edit.component.html',
  styleUrls: ['./tutorial-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TutorialEditComponent implements OnInit {
  isLoading: boolean = false;
  tutorial: ITutorial;
  isEditing: boolean = false;

  //editor vars
  @ViewChild('editor') editor: any;
  headings: string[] = ['1', '2', '3', '4', '5', '6', '7'];

  //form vars
  topicsWithMainTopic: any[];
  tutorialForm: FormGroup;
  tutorialTypes: string[] = ['main topic', 'sub topic'];
  tutorialTopics: string[] = [
    'introduction',
    'solvers',
    'brief',
    'brief response',
    'collection',
    'feed',
    'interests',
    'organization profile',
    'proactive posting',
    'user profile',
    'webinar',
    'admin panel'
  ];

  invitations: any[];

  constructor(
    private modalController: ModalController,
    private dataService: DataService,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private fileService: FilesService
  ) {
    this.createForm();
  }

  async ngOnInit() {
    this.tutorialTopics.sort();
    const tutorialId = this.route.snapshot.params.id;
    if (!!tutorialId && tutorialId.length) {
      this.tutorial = (await this.dataService.find('/tutorial', tutorialId).toPromise()).body;
      this.isEditing = true;
      this.prepareDataToEdit();
    }
    this.topicsWithMainTopic = _.uniq(
      (await this.dataService.list('/tutorial', { type: 'main topic' }).toPromise()).body.map(
        tutorial => tutorial.topic
      )
    );
  }

  ngOnDestroy() {}

  copyUrl(url: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = url;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  hasMainTopic(event: any) {
    if (this.topicsWithMainTopic.includes(event.value)) {
      this.tutorialForm.controls.type.setValue('sub topic');
      this.tutorialForm.controls.type.disable();
    } else this.tutorialForm.controls.type.enable();
  }

  //editor methods begin
  format(command: any, value?: any) {
    document.execCommand(command, false, value);
  }

  async addImage(event: any) {
    const imageSrc = (await this.fileService.uploadEditor(event.target.files[0])).body.imageUrl;
    const img = `<img src="${imageSrc}" />`;
    this.editor.nativeElement.focus();
    document.execCommand('insertHTML', false, img);
    this.addImgClickListener(imageSrc);
  }

  addImgClickListener(imgSrc: string) {
    const imgElement = document.querySelector(`img[src='${imgSrc}']`);
    imgElement.addEventListener('click', async () => {
      const modal = this.modalController.create({
        component: ModalImageResize,
        cssClass: 'modal-resize',
        componentProps: {
          imgElement
        }
      });
      (await modal).present();
    });
  }

  addLink() {
    const linkURL = prompt('Enter a URL:', 'http://');
    if (window.getSelection) {
      document.execCommand(
        'insertHTML',
        false,
        '<a href="' + linkURL + '" target="_blank">' + window.getSelection() + '</a>'
      );
    }
  }

  addVideo() {
    const youtubeId = prompt('Enter a Youtube video id:', 'Id');
    document.execCommand(
      'insertHTML',
      false,
      '<div class="iframe-container"><iframe class="lazyloaded" width="100%" src="https://www.youtube.com/embed/' +
        youtubeId +
        '" title="YouTube video player" frameborder="0" allow="accelerometer; clipboard-write; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
    );
  }

  openedChange(event: any) {
    document.execCommand('fontSize', false, '1');
  }

  setHeading(event: any) {
    const size = event.target.value.toString().replace('h', '');
    document.execCommand('fontSize', false, size);
  }

  //editor methods end

  async deleteTutorial() {
    await this.dataService.remove('/tutorial', this.tutorial).toPromise();
    this.router.navigate(['/admin/tutorials'], { replaceUrl: true });
  }

  prepareDataToSubmit() {
    if (!this.isEditing) this.tutorial = new Tutorial();
    this.tutorial.title = this.tutorialForm.controls.title.value;
    this.tutorial.text = this.editor.nativeElement.innerHTML;
    this.tutorial.type = this.tutorialForm.controls.type.value;
    this.tutorial.topic = this.tutorialForm.controls.topic.value;
  }

  prepareDataToEdit() {
    this.tutorialForm.controls.title.setValue(this.tutorial.title);
    this.editor.nativeElement.innerHTML = this.tutorial.text;
    this.tutorialForm.controls.type.setValue(this.tutorial.type);
    this.tutorialForm.controls.topic.setValue(this.tutorial.topic);
    document.querySelectorAll('img').forEach(img => this.addImgClickListener(img.src));
  }

  markFormGroupTouched(formGroup: FormGroup) {
    (Object as any).values(formGroup.controls).forEach((control: FormGroup) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  async submit() {
    this.markFormGroupTouched(this.tutorialForm);
    if (this.tutorialForm.valid) {
      this.prepareDataToSubmit();
      try {
        this.isLoading = true;
        if (this.isEditing) {
          this.tutorial = (await this.dataService.update('/tutorial', this.tutorial).toPromise()).body;
        } else {
          this.tutorial = (await this.dataService.create('/tutorial', this.tutorial).toPromise()).body;
        }
        this.isLoading = false;
        this.router.navigate(['/admin/tutorials'], { replaceUrl: true });
      } catch (err) {
        console.log(err);
      }
    }
  }

  private createForm() {
    this.tutorialForm = this.formBuilder.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      topic: ['', Validators.required],
      text: ['']
    });
  }

  cancel() {
    this.router.navigate(['/admin/tutorials'], { replaceUrl: true });
  }
}
