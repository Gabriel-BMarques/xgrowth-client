import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { AlertController } from '@ionic/angular';
import { DataService } from './../../services/data.service';
import { Component, OnInit } from '@angular/core';
import { ITutorial } from '@app/shared/models/tutorial.model';
import * as _ from 'lodash';
import { UserInfoService } from '@app/services/user-info.service';

declare let woopra: any;

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss']
})
export class TutorialComponent implements OnInit {
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };
  skeletonLoading = true;
  tutorials: ITutorial[];
  tutorialTopics: any[];
  isOpen: boolean[] = [];
  selectedTutorial: ITutorial = null;

  constructor(
    private dataService: DataService,
    public alertController: AlertController,
    private router: Router,
    private userInfoService: UserInfoService
  ) {}

  get userInfo(): any {
    return this.userInfoService.storedUserInfo;
  }

  async ngOnInit() {
    await this.fetchTutorials();
    const introduction = this.tutorials.find(t => t.topic === 'introduction');
    if (introduction) this.setSelectedTutorial(introduction);
  }

  async ionViewWillEnter() {
    this.userInfoService.refreshUserInfo();
  }

  hasSubTopics(topic: any): boolean {
    return this.tutorials.some(tutorial => tutorial.type === 'sub topic' && tutorial.topic === topic);
  }

  async fetchTutorials() {
    this.skeletonLoading = true;
    this.tutorials = (await this.dataService.list('/tutorial', { visible: true }).toPromise()).body;
    this.tutorialTopics = _.uniq(this.tutorials.map(tutorial => tutorial.topic)).sort();
    const index = this.tutorialTopics.findIndex(topic => topic === 'introduction');
    this.tutorialTopics.unshift(this.tutorialTopics.splice(index, 1)[0]);
    for (let index = 0; index < this.tutorialTopics.length; index++) {
      this.isOpen[index] = false;
    }
    console.log(this.isOpen);
    this.skeletonLoading = false;
    if (environment.production) this.woopraIdentify(this.userInfo), this.woopraTrack(this.userInfo);
  }

  woopraIdentify(user: any) {
    woopra
      .identify({
        email: user.email,
        id: user.email,
        name: `${user.firstName} ${user.familyName}`,
        firstname: user.firstName,
        familyname: user.familyName,
        company: user.company?.companyName,
        department: user.department,
        jobTitle: user.jobTitle
      })
      .push();
  }
  woopraTrack(user: any) {
    woopra.track('help center view', {
      author: user.email,
      id: user.email,
      name: user.email,
      company: user.company.companyName,
      department: user.department,
      jobTitle: user.jobTitle,
      topic: 'Help Center Visualization',
      title: document.title,
      url: window.location.href
    });
  }

  toggleSection(index: number, topic: string) {
    const mainTutorial = this.tutorials.find(t => t.topic === topic && t.type === 'main topic');
    if (!!mainTutorial) this.setSelectedTutorial(mainTutorial);
    for (let i = 0; i < this.tutorialTopics.length; i++) {
      if (i !== index) this.isOpen[i] = false;
    }
    this.isOpen[index] = !this.isOpen[index];
    console.log(this.isOpen);
  }

  setSelectedTutorial(entity: ITutorial) {
    this.selectedTutorial = undefined;
    this.selectedTutorial = entity;
  }

  seeDetails(tutorialId: string) {
    this.router.navigate(['/tutorial/details/', tutorialId], { replaceUrl: true });
  }

  back() {
    this.selectedTutorial = null;
  }
}
