import { Injectable } from '@angular/core';
import { PanelData } from '@app/shared/models/panelData.model';
import { IUploadedFile } from '@app/shared/models/uploadedFile.model';
import { User } from '@app/shared/models/user.model';
import { Profile } from '@app/shared/models/profile.model';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { IOrganization } from '@app/shared/models/organizations.model';
import { IPost } from '@app/shared/models/post.model';
import { IBrief } from '@app/shared/models/brief.model';

@Injectable({
  providedIn: 'root'
})
export class MockService {
  panelData: PanelData;
  users: User[];
  coworkers: Profile[];
  companies: ICompanyProfile[];
  briefs: IBrief[];
  organizations: IOrganization[];
  posts: IPost[];
  post: IPost;
  company: ICompanyProfile;
  titles: string[];
  subtitles: string[];
  descriptions: string[];
  randomImage: string;
  randomUploadedFile: IUploadedFile;
  firstNames: string[];
  familyNames: string[];
  roles: string[];
  emails: string[];
  countries: string[];
  productPanel: string;
  memberPanel: string;
  postPanel: string;
  briefPanel: string;
  supplierPanel: string;
  newsPanel: string;
  notificationPanel: string;
  messagePanel: string;
  collectionPanel: string;
  draftPanel: string;

  constructor() {
    (this.titles = [
      'Brighteeth',
      'Chocookie',
      'Parfum',
      'GummyGum',
      'Beerfest',
      'Turboil',
      'Cookbright',
      'Colorance',
      'Appie',
      'Mealosia',
      'Kitchick',
      'Brewingo',
      'Lustyle',
      'Recrowave',
      'Toastia',
      'Cookinge'
    ]),
      (this.subtitles = [
        'Flavors X',
        'Flavors Y',
        'Flavors Z',
        'Ingredients X',
        'Ingredients Y',
        'Ingredients Z',
        'Supplier X',
        'Supplier Y',
        'Supplier Z'
      ]),
      (this.descriptions = [
        'Lorem ipsum dolor sit amet',
        'Consectetur adipiscing elit',
        'Aenean tortor libero',
        'Convalis sed odio ut',
        'Auctor porta ante',
        'Sed at neque eget sapien hendrerit',
        'Finibus non sit amet diam',
        'Nullam ut eros magnis dis parturient montes'
      ]),
      (this.randomImage = 'https://picsum.photos/id/'),
      (this.firstNames = [
        'Aaron',
        'Bart',
        'Carol',
        'Damian',
        'Eddy',
        'Fernando',
        'Gale',
        'Hans',
        'Isaiah',
        'Jamie',
        'Kasey',
        'Laverne',
        'Maria',
        'Nelson',
        'Omar',
        'Percy',
        'Quincy',
        'Rylan',
        'Sandy',
        'Theo',
        'Umberto',
        'Valentina',
        'Wendy',
        'Xavier',
        'Yang',
        'Zoey'
      ]),
      (this.familyNames = [
        'Abbey',
        'Barnwell',
        'Cabello',
        'Davies',
        'Eckhart',
        'Fuller',
        'Gray',
        'Hilton',
        'Iglesias',
        'Johnson',
        'Kelsing',
        'Lafort',
        'Monroe',
        'Nicholson',
        'Orwell',
        'Philips',
        'Quigg',
        'Richardson',
        'Sheffield',
        'Taylor',
        'Ulrich',
        'Vaughn',
        'Walker',
        'Xiang',
        'Yancy'
      ]),
      (this.roles = ['user', 'different user', 'manager', 'admin']),
      (this.emails = [
        'gavinls@yahoo.com',
        'niknejad@aol.com',
        'gtaylor@me.com',
        'jesse@msn.com',
        'chance@outlook.com',
        'scitext@live.com',
        'fhirsch@aol.com',
        'joehall@gmail.com',
        'kwilliams@verizon.net',
        'wagnerch@att.net',
        'tmccart@me.com',
        'sblack@optonline.net',
        'mirod@live.com',
        'afeldspar@msn.com',
        'mgreen@outlook.com',
        'oechslin@optonline.net',
        'demmel@outlook.com',
        'sign@sbcglobal.net',
        'raides@gmail.com',
        'chaikin@yahoo.com',
        'drewf@aol.com',
        'madler@outlook.com',
        'slanglois@msn.com',
        'cliffordj@optonline.com',
        'ccohen@yahoo.com'
      ]);
    this.countries = [
      'Argentina',
      'Brazil',
      'Canada',
      'Denmark',
      'Ethiopia',
      'Finland',
      'Greece',
      'Hungary',
      'Iceland',
      'Japan',
      'Kenya',
      'Liberia',
      'Madagascar',
      'Nigeria',
      'Oman',
      'Phillipines',
      'Qatar',
      'Russia',
      'South Africa',
      'Turkey',
      'United States of America',
      'Vietnam',
      'Yemen',
      'Zimbabwe'
    ];
    this.companies = [];
    this.randomCompanies();
    this.getTranslations();
  }

  getTranslations() {
    if (localStorage.getItem('language') === 'en-US') {
      this.productPanel = 'Product Panel';
      this.memberPanel = 'Members Panel';
      this.postPanel = 'Posts Panel';
      this.supplierPanel = 'Supplier You May Like';
      this.newsPanel = 'Latest News';
      this.notificationPanel = 'Notifications';
      this.messagePanel = 'Messages';
      this.collectionPanel = 'Collections';
      this.draftPanel = 'Drafts';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.productPanel = 'Produtos';
      this.memberPanel = 'Membros';
      this.postPanel = 'Posts';
      this.supplierPanel = 'Fornecedores para você';
      this.newsPanel = 'Últimas Notícias';
      this.notificationPanel = 'Notificações';
      this.messagePanel = 'Mensagens';
      this.collectionPanel = 'Coleções';
      this.draftPanel = 'Rascunhos';
    }
  }

  randomItems(maxItems?: number) {
    if (maxItems === undefined) {
      Object.entries(this.titles).forEach(([key, value]) => {
        const randomTitle = Math.floor(Math.random() * this.titles.length);
        const randomSubtitle = Math.floor(Math.random() * this.subtitles.length);
        const randomDescription = Math.floor(Math.random() * this.descriptions.length);
        const randomUploadedFiles: IUploadedFile[] = [];
        const randomPicture = Math.floor(Math.random() * 200);
        const randomHeight = Math.floor(Math.random() * (199 - 160) + 160);

        for (let indexFiles = 0; indexFiles < 5; indexFiles++) {
          randomUploadedFiles.push({
            url: this.randomImage + randomPicture + '/130/' + randomHeight,
            Name: this.titles[randomTitle]
          });
        }

        this.panelData.items.push({
          title: this.titles[randomTitle],
          subtitle: this.subtitles[randomSubtitle],
          description: this.descriptions[randomDescription],
          UploadedFiles: randomUploadedFiles,
          isPublic: Math.random() >= 0.5
        });
      });
    } else {
      for (let indexItems = 0; indexItems < maxItems; indexItems++) {
        const randomTitle = Math.floor(Math.random() * this.titles.length);
        const randomSubtitle = Math.floor(Math.random() * this.subtitles.length);
        const randomDescription = Math.floor(Math.random() * this.descriptions.length);
        const randomUploadedFiles: IUploadedFile[] = [];
        const randomPicture = Math.floor(Math.random() * 200);
        const randomHeight = Math.floor(Math.random() * (199 - 160) + 160);

        for (let indexFiles = 0; indexFiles < 5; indexFiles++) {
          randomUploadedFiles.push({
            url: this.randomImage + randomPicture + '/130/' + randomHeight,
            Name: this.titles[randomTitle]
          });
        }

        this.panelData.items.push({
          title: this.titles[randomTitle],
          subtitle: this.subtitles[randomSubtitle],
          description: this.descriptions[randomDescription],
          UploadedFiles: randomUploadedFiles,
          isPublic: Math.random() >= 0.5
        });
      }
    }
  }

  randomItem(item: string) {
    if (item === 'post') {
      const randomTitle = Math.floor(Math.random() * this.titles.length);
      const randomDescription = Math.floor(Math.random() * this.descriptions.length);
      const randomUploadedFiles: IUploadedFile[] = [];
      const randomCategories: string[] = [];

      for (let indexFiles = 0; indexFiles < 5; indexFiles++) {
        const randomPicture = Math.floor(Math.random() * 200);
        const randomHeight = Math.floor(Math.random() * (800 - 600) + 600);
        const randomCategory = Math.floor(Math.random() * this.titles.length);
        randomUploadedFiles.push({
          url: this.randomImage + randomPicture + '/500/' + randomHeight,
          Name: this.titles[randomCategory]
        });
        randomCategories.push(this.titles[randomCategory]);
      }

      this.post = {
        Title: this.titles[randomTitle],
        Description: this.descriptions[randomDescription],
        UploadedFiles: randomUploadedFiles,
        Categories: randomCategories
      };
    }
  }

  randomPosts(maxItems?: number) {
    if (maxItems === undefined) {
      Object.entries(this.titles).forEach(([key, value]) => {
        const randomTitle = Math.floor(Math.random() * this.titles.length);
        const randomDescription = Math.floor(Math.random() * this.descriptions.length);
        const randomUploadedFiles: IUploadedFile[] = [];

        for (let indexFiles = 0; indexFiles < 5; indexFiles++) {
          const randomPicture = Math.floor(Math.random() * 200);
          const randomHeight = Math.floor(Math.random() * (800 - 600) + 600);
          const randomCategory = Math.floor(Math.random() * this.titles.length);
          randomUploadedFiles.push({
            url: this.randomImage + randomPicture + '/500/' + randomHeight,
            Name: this.titles[randomCategory]
          });
        }

        this.posts.push({
          Title: this.titles[randomTitle],
          Description: this.descriptions[randomDescription],
          UploadedFiles: randomUploadedFiles
        });
      });
    } else {
      for (let indexItems = 0; indexItems < maxItems; indexItems++) {
        const randomTitle = Math.floor(Math.random() * this.titles.length);
        const randomDescription = Math.floor(Math.random() * this.descriptions.length);
        const randomUploadedFiles: IUploadedFile[] = [];

        for (let indexFiles = 0; indexFiles < 5; indexFiles++) {
          const randomPicture = Math.floor(Math.random() * 200);
          const randomHeight = Math.floor(Math.random() * (800 - 600) + 600);
          const randomCategory = Math.floor(Math.random() * this.titles.length);
          randomUploadedFiles.push({
            url: this.randomImage + randomPicture + '/500/' + randomHeight,
            Name: this.titles[randomCategory]
          });
        }

        this.posts.push({
          Title: this.titles[randomTitle],
          Description: this.descriptions[randomDescription],
          UploadedFiles: randomUploadedFiles
        });
      }
    }
  }

  randomUsers(maxUsers?: number) {
    if (maxUsers === undefined) {
      Object.entries(this.firstNames).forEach(([key, value]) => {
        const randomFirstName = Math.floor(Math.random() * this.firstNames.length);
        const randomFamilyName = Math.floor(Math.random() * this.familyNames.length);
        const randomRole = Math.floor(Math.random() * this.roles.length);
        const randomEmail = Math.floor(Math.random() * this.emails.length);

        this.users.push({
          firstName: this.firstNames[randomFirstName],
          familyName: this.familyNames[randomFamilyName],
          role: this.roles[randomRole],
          email: this.emails[randomEmail]
        });
      });
    } else {
      for (let indexUsers = 0; indexUsers < maxUsers; indexUsers++) {
        const randomFirstName = Math.floor(Math.random() * this.firstNames.length);
        const randomFamilyName = Math.floor(Math.random() * this.familyNames.length);
        const randomRole = Math.floor(Math.random() * this.roles.length);
        const randomEmail = Math.floor(Math.random() * this.emails.length);

        this.users.push({
          firstName: this.firstNames[randomFirstName],
          familyName: this.firstNames[randomFamilyName],
          role: this.firstNames[randomRole],
          email: this.firstNames[randomEmail]
        });
      }
    }
  }

  randomProfiles(maxProfiles?: number) {
    if (maxProfiles === undefined) {
      Object.entries(this.firstNames).forEach(([key, value]) => {
        const randomFirstName = Math.floor(Math.random() * this.firstNames.length);
        const randomFamilyName = Math.floor(Math.random() * this.familyNames.length);
        const randomCompany = Math.floor(Math.random() * this.companies.length);
        const randomEmail = Math.floor(Math.random() * this.emails.length);

        this.coworkers.push({
          name: this.firstNames[randomFirstName],
          familyName: this.familyNames[randomFamilyName],
          email: this.emails[randomEmail],
          company: this.companies[randomCompany]
        });
      });
    } else {
      for (let indexUsers = 0; indexUsers < maxProfiles; indexUsers++) {
        const randomFirstName = Math.floor(Math.random() * this.firstNames.length);
        const randomFamilyName = Math.floor(Math.random() * this.familyNames.length);
        const randomCompany = Math.floor(Math.random() * this.companies.length);
        const randomEmail = Math.floor(Math.random() * this.emails.length);

        this.coworkers.push({
          name: this.firstNames[randomFirstName],
          familyName: this.firstNames[randomFamilyName],
          company: this.companies[randomCompany],
          email: this.firstNames[randomEmail]
        });
      }
    }
  }

  randomCompanies(maxCompanies?: number) {
    if (maxCompanies === undefined) {
      Object.entries(this.titles).forEach(([key, value]) => {
        const randomCompanyName = Math.floor(Math.random() * this.titles.length);
        const randomEmail = Math.floor(Math.random() * this.emails.length);
        const randomCountry = Math.floor(Math.random() * this.countries.length);

        this.companies.push({
          companyName: this.titles[randomCompanyName],
          country: this.countries[randomCountry]
        });
      });
    } else {
      for (let indexUsers = 0; indexUsers < maxCompanies; indexUsers++) {
        const randomCompanyName = Math.floor(Math.random() * this.titles.length);
        const randomEmail = Math.floor(Math.random() * this.emails.length);
        const randomCountry = Math.floor(Math.random() * this.countries.length);

        this.companies.push({
          companyName: this.titles[randomCompanyName],
          country: this.countries[randomCountry]
        });
      }
    }
  }

  randomCompany() {
    const randomCompanyName = Math.floor(Math.random() * this.titles.length);
    const randomEmail = Math.floor(Math.random() * this.emails.length);
    const randomCountry = Math.floor(Math.random() * this.countries.length);

    // this.company = {
    //   companyName: this.titles[randomCompanyName],
    //   allowedDomain: this.emails[randomEmail],
    //   country: this.countries[randomCountry]
    // };
  }

  randomOrganizations(maxOrganizations?: number) {
    if (maxOrganizations === undefined) {
      Object.entries(this.titles).forEach(([key, value]) => {
        const randomOrganizationName = Math.floor(Math.random() * this.titles.length);
        const randomEmail = Math.floor(Math.random() * this.emails.length);
        const randomCompanies = this.generateCompanies(7);

        // this.organizations.push({
        //   name: this.titles[randomOrganizationName],
        //   allowedDomain: this.emails[randomEmail],
        //   companies: randomCompanies
        // });
      });
    } else {
      for (let indexUsers = 0; indexUsers < maxOrganizations; indexUsers++) {
        const randomOrganizationName = Math.floor(Math.random() * this.titles.length);
        const randomEmail = Math.floor(Math.random() * this.emails.length);
        const randomCompanies = this.generateCompanies(7);

        // this.organizations.push({
        //   name: this.titles[randomOrganizationName],
        //   allowedDomain: this.emails[randomEmail],
        //   companies: randomCompanies
        // });
      }
    }
  }

  generateItem(item: string) {
    this.randomItem(item);
    if (item === 'post') {
      return this.post;
    }
  }

  generateCompany() {
    this.randomCompany();
    return this.company;
  }

  generateProducts(amount?: number) {
    this.panelData = {
      type: 'products',
      name: this.productPanel,
      items: []
    };
    this.randomItems(amount);
    return this.panelData;
  }

  generateMembers(amount?: number) {
    this.panelData = {
      type: 'members',
      name: this.memberPanel,
      items: []
    };
    this.randomItems(amount);
    return this.panelData;
  }

  generatePosts(amount?: number) {
    this.panelData = {
      type: 'posts',
      name: this.postPanel,
      items: []
    };
    this.randomItems(amount);
    return this.panelData;
  }

  generateBriefs(amount?: number) {
    this.panelData = {
      type: 'briefs',
      name: this.briefPanel,
      items: []
    };
    this.randomItems(amount);
    return this.panelData;
  }

  generateCategories(amount?: number, categoryName?: string) {
    this.panelData = {
      type: 'categories',
      name: categoryName,
      items: []
    };
    this.randomItems(amount);
    return this.panelData;
  }

  generateSuppliers(amount?: number) {
    this.panelData = {
      type: 'suppliers',
      name: this.supplierPanel,
      items: []
    };
    this.randomItems(amount);
    return this.panelData;
  }

  generateNews(amount?: number) {
    this.panelData = {
      type: 'news',
      name: this.newsPanel,
      items: []
    };
    this.randomItems(amount);
    return this.panelData;
  }

  generateNotifications(amount?: number) {
    this.panelData = {
      type: 'notifications',
      name: this.notificationPanel,
      items: []
    };
    this.randomItems(amount);
    return this.panelData;
  }

  generateMessages(amount?: number) {
    this.panelData = {
      type: 'messages',
      name: this.messagePanel,
      items: []
    };
    this.randomItems(amount);
    return this.panelData;
  }

  generateCollections(amount?: number) {
    this.panelData = {
      type: 'collections',
      name: this.collectionPanel,
      items: []
    };
    this.randomItems(amount);
    return this.panelData;
  }

  generateDrafts(amount?: number) {
    this.panelData = {
      type: 'drafts',
      name: this.draftPanel,
      items: []
    };
    this.randomItems(amount);
    return this.panelData;
  }

  generateUsers(amount?: number) {
    this.users = [];
    this.randomUsers(amount);
    return this.users;
  }

  generateCoworkers(amount?: number) {
    this.coworkers = [];
    this.randomProfiles(amount);
    return this.coworkers;
  }

  generateCompanies(amount?: number) {
    this.companies = [];
    this.randomCompanies(amount);
    return this.companies;
  }

  generateOrganizations(amount?: number) {
    this.organizations = [];
    this.randomOrganizations(amount);
    return this.organizations;
  }

  generatePosts2(amount?: number) {
    this.posts = [];
    this.randomPosts(amount);
    return this.posts;
  }
}
