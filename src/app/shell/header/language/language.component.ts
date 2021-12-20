import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss']
})
export class LanguageComponent implements OnInit {
  isPortuguese: boolean;
  isEnglish: boolean;
  private language = 'en-US';

  constructor(public translate: TranslateService) {}

  ngOnInit() {
    const language = localStorage.getItem('language');
    switch (language) {
      case 'pt-BR':
        this.isPortuguese = true;
        this.isEnglish = false;
        break;
      case 'en-US':
        this.isPortuguese = false;
        this.isEnglish = true;
        break;
      default:
        break;
    }
  }

  switchEnglish() {
    this.language = 'en-US';
    this.translate.use('en-US');
    localStorage.setItem('language', 'en-US');
    this.isPortuguese = false;
    this.isEnglish = true;
  }

  switchPortuguese() {
    this.language = 'pt-BR';
    this.translate.use('pt-BR');
    localStorage.setItem('language', 'pt-BR');
    this.isEnglish = false;
    this.isPortuguese = true;
  }
}
