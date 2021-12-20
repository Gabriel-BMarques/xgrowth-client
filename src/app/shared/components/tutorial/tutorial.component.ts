import { Component, Input, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { FilesService } from '@app/services/files.service';
import { Router } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { CredentialsService } from '@app/core';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss']
})
export class TutorialComponent implements OnInit {
  @Input() tutorialType: string;
  @Input() tutorialStyle: number;
  @Output() nextTutorialEvent = new EventEmitter();

  nextTutorial: number = 0;
  closeTutorial: number = 10; //number that jumps all steps and trigger event to end tutorials
  tutorialTitle: string;
  tutorialText: string;
  tutorialButton: string;

  constructor(
    private filesService: FilesService,
    private router: Router,
    private dataService: DataService,
    private credentialService: CredentialsService
  ) {}

  async ngOnInit() {
    this.assingTexts();
  }

  returnOrder() {
    switch (this.tutorialType) {
      // BRIEFS PAGE -----------------------------------------------
      case 'new-briefs-page':
        this.nextTutorial = 1;
        break;
      case 'list-grid':
        this.nextTutorial = 2;
        break;
      case 'search':
        this.nextTutorial = 3;
        break;
      case 'filter':
        this.nextTutorial = 4;
        break;
      case 'filter-last':
        this.nextTutorial = this.closeTutorial;
        break;
      case 'categories':
        this.nextTutorial = this.closeTutorial;
        break;

      // INTERESTS PAGE ------------------------------
      case 'interests':
        this.nextTutorial = this.closeTutorial;
        break;

      // SOLVERS PAGE --------------------------------
      case 'solvers-page':
        this.nextTutorial = 1;
        break;
      case 'solvers-search':
        this.nextTutorial = 2;
        break;
      case 'solvers-filter':
        this.nextTutorial = 3;
        break;
      case 'solver-sort':
        this.nextTutorial = this.closeTutorial;
        break;
    }
    this.nextTutorialEvent.emit({ nextTutorial: this.nextTutorial });
  }

  close() {
    this.nextTutorialEvent.emit({ nextTutorial: this.closeTutorial });
  }

  assingTexts() {
    switch (this.tutorialType) {
      case 'list-grid':
        this.tutorialTitle = 'Grid or list mode';
        this.tutorialText = "Choose the view mode you like the most and if you'd like to see more or less details";
        this.tutorialButton = 'Next >';
        break;
      case 'search':
        this.tutorialTitle = "Do you already know what you're looking for?";
        this.tutorialText =
          'Type the brief title, description, category, organization or Business Unit for the wanted brief.';
        this.tutorialButton = 'Next >';
        break;
      case 'filter':
        this.tutorialTitle = 'Looking for something very specific?';
        this.tutorialText = 'Find what you need faster than ever by selecting parameters and applying filters!';
        this.tutorialButton = 'Next >';
        break;
      case 'filter-last':
        this.tutorialTitle = 'Looking for something very specific?';
        this.tutorialText = 'Find what you need faster than ever by selecting parameters and applying filters!';
        this.tutorialButton = 'Finish tour';
        break;
      case 'categories':
        this.tutorialTitle = 'What matters for you?';
        this.tutorialText =
          'Quickly access briefs that interest you based on the categories you\'ve selected as "Interests"';
        this.tutorialButton = 'Finish tour';
        break;
      case 'new-briefs-page':
        this.tutorialTitle = 'Understand the new Briefs page!';
        this.tutorialText = 'Take a tour to learn and take advantage of all new possibilities on this page.';
        this.tutorialButton = 'Learn more';
        break;
      case 'interests':
        this.tutorialTitle = 'Welcome to your interests page!';
        this.tutorialText =
          'Here are categories and subcategories of your organization. Select the ones that are of your interest to customize your xGrowth environment and notifications!';
        this.tutorialButton = 'Start now';
        break;
      case 'solvers-page':
        this.tutorialTitle = 'Welcome to the new Solvers page';
        this.tutorialText = 'Take a tour to learn and take advantage of all new possibilities on this page.';
        this.tutorialButton = 'Take the tour';
        break;
      case 'solvers-search':
        this.tutorialTitle = 'Do you have a solver in mind?';
        this.tutorialText = 'Search for an organization name and check its profile';
        this.tutorialButton = 'Next';
        break;
      case 'solvers-filter':
        this.tutorialTitle = 'Looking for some specific parameter?';
        this.tutorialText = 'You can filter and narrow your search better';
        this.tutorialButton = 'Next';
        break;
      case 'solver-sort':
        this.tutorialTitle = 'View the page as you prefer';
        this.tutorialText = 'Choose the best way to sort results';
        this.tutorialButton = 'Finish';
        break;
    }
  }
}
