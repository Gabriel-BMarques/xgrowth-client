import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { AlertController, IonContent } from '@ionic/angular';
import { Router } from '@angular/router';
import { ITutorial } from '@app/shared/models/tutorial.model';
import * as _ from 'lodash';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-tutorials',
  templateUrl: './tutorials.component.html',
  styleUrls: ['./tutorials.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TutorialsComponent implements OnInit {
  header: string;
  isLoading = false;
  currentModal: any;
  skeletonLoading = true;

  tutorials: ITutorial[];
  tutorialsAux: ITutorial[];
  tutorialTopics: string[];
  tutorialTopicsAux: string[];
  tutorialReactions: any[];

  selectedTutorial: ITutorial = null;
  selectedPreview: boolean;

  constructor(
    private dataService: DataService,
    public alertController: AlertController,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    await this.fetchTutorials();
  }

  async fetchTutorials() {
    this.skeletonLoading = true;
    this.tutorials = (await this.dataService.list('/tutorial').toPromise()).body;
    this.tutorialsAux = this.tutorials;
    this.tutorialTopics = _.uniq(this.tutorials.map(tutorial => tutorial.topic)).sort();
    this.tutorialTopicsAux = this.tutorialTopics;
    this.tutorialReactions = (await this.dataService.list('/tutorial-reaction').toPromise()).body;
    this.skeletonLoading = false;
  }

  async toggleVisibility($event: any, tutorial: ITutorial) {
    tutorial.visible = $event.checked;
    await this.dataService.update('/tutorial', tutorial).toPromise();
  }

  countReactions(tutorialId: string, reaction: string) {
    return this.tutorialReactions.filter(r => r.type === reaction && r.tutorialId === tutorialId).length;
  }

  applyFilter(filterValue: string) {
    if (filterValue === null) {
      this.tutorials = this.tutorialsAux;
      this.tutorialTopics = this.tutorialTopicsAux;
      return;
    }

    filterValue = filterValue.trim().toLowerCase();
    this.tutorials = this.tutorialsAux.filter(tutorial =>
      tutorial.title
        .trim()
        .toLowerCase()
        .includes(filterValue)
    );
    this.tutorialTopics = _.uniq(this.tutorials.map(tutorial => tutorial.topic)).sort();
  }

  async addTutorial() {
    this.router.navigate(['/admin/tutorials/add'], { replaceUrl: true });
  }

  async editTutorial(entity?: any) {
    this.router.navigate(['/admin/tutorials/edit', `${entity._id}`], { replaceUrl: true });
  }

  previewTutorial(tutorial: any) {
    this.selectedPreview = true;
    this.selectedTutorial = tutorial;
  }

  htmlText(tutorial: any) {
    let text = this.sanitizer.bypassSecurityTrustHtml(tutorial.text);
    return text;
  }
}
