import { Injectable } from '@angular/core';
import { HttpResponse, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataService } from '@app/services/data.service';
import { update } from 'lodash';
import { IPost } from '@app/shared/models/post.model';
import { Category } from '@app/shared/models/category.model';
import { IBrief } from '@app/shared/models/brief.model';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { IOrganization } from '@app/shared/models/organizations.model';
import { IUser } from '@app/shared/models/user.model';
import { CompanyRelation } from '@app/shared/models/companyRelation.model';
import { CredentialsService } from '@app/core/authentication/credentials.service';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MigrationService {
  constructor(private http: HttpClient, private dataService: DataService, private credentials: CredentialsService) {
    // this.addCompanyTypes();
  }

  async migrateData() {
    // this.migrateBuToUser();
    // let briefs: any[] = [];
    // let briefSuppliers: any[] = [];
    // let posts: any[] = [];
    // let companies: any[] = [];
    // let collections: any[] = [];
    // await this.dataService.listAll('/brief').toPromise().then(res => {
    //   briefs = res.body;
    // });
    // await this.dataService.listAll('/brief-supplier').toPromise().then(res => {
    //   briefSuppliers = res.body;
    // });
    // await this.dataService.listAll('/post').toPromise().then(res => {
    //   posts = res.body;
    // });
    // await this.dataService.listAll('/company-profile').toPromise().then(res => {
    //   companies = res.body;
    // });
    // await this.dataService.listAll('/collections').toPromise().then(res => {
    //   collections = res.body;
    // });
    // this.migrateBriefData(briefs, briefSuppliers);
    // this.migratePostsData(posts, collections);
    // this.migrateCompaniesData(companies);
    // this.migrateJobTitleAndDepartments();
  }

  migrateBriefData(briefs?: any[], briefSuppliers?: any[]) {
    if (briefSuppliers) {
      // this.migrateFilesFromBriefSuppliers(briefSuppliers);
      // this.migrateSignedNdaFromBriefSuppliers(briefSuppliers);
    }
    if (briefs) {
      // this.migrateFilesFromBrief(briefs);
      // this.migrateTypesFromBrief(briefs);
      // this.migrateImagesAndAttachments('brief', briefs);
      // this.setCblxBriefsToPublished(briefs);
      // this.migrateCategoriesFromBriefs(briefs);
      // this.migrateBriefMarketsFromBriefs(briefs);
      // this.flagCblxEntities('brief');
    }
  }

  migratePostsData(posts?: any[], collections?: any[]) {
    if (posts) {
      // this.flagCblxEntities('post');
      // this.migrateCategoriesFromPosts(posts);
      // this.migrateCompaniesFromPosts(posts);
      // this.migrateImagesAndAttachments('post', posts);
      // this.migratePostsIdsFromCollections(collections);
    }
  }

  migrateCompaniesData(companies: any[]) {
    // this.setCompaniesNumberOfPosts(companies);
    // this.migrateCompanyProfilePictures(companies);
    // this.createCompaniesOrganizations(companies);
    // this.setProspectSolversAsSolverOfAllSolvers(companies);
  }

  migrateFilesFromBriefSuppliers(briefSuppliers: any[]) {
    const filteredBriefSuppliers = briefSuppliers.filter(entity => {
      return entity.NdaFileId !== null;
    });
    filteredBriefSuppliers.map(entity => {
      this.dataService.getByIdGuid('/upload', entity.NdaFileId).subscribe(res => {
        entity.Nda = {};
        entity.Nda._id = res.body[0]._id;
        entity.Nda.name = res.body[0].Name;
        entity.Nda.url = res.body[0].url;
        this.dataService.update('/brief-supplier', entity).subscribe(briefSupplier => {});
      });
    });
  }

  migrateFilesFromBrief(briefs: any[]) {
    const filteredBriefs = briefs.filter(entity => {
      return entity.NdaFileId !== null;
    });
    filteredBriefs.map(entity => {
      this.dataService.getByIdGuid('/upload', entity.NdaFileId).subscribe(res => {
        entity.Nda = {};
        entity.Nda._id = res.body[0]._id;
        entity.Nda.name = res.body[0].Name;
        entity.Nda.url = res.body[0].url;
        this.dataService.update('/brief', entity).subscribe(() => {});
      });
    });
  }

  migrateTypesFromBrief(briefs: any[]) {
    briefs.map(entity => {
      this.dataService.getByIdGuid('/misc/brief-type', entity.Type).subscribe(res => {
        entity.type = {};
        entity.type._id = res.body[0]._id;
        entity.type.name = res.body[0].name;
        entity.type.description = res.body[0].description;
        this.dataService.update('/brief', entity).subscribe(brief => {});
      });
    });
  }

  migrateCompanyProfilePictures(companies: any[]) {
    companies.map(entity => {
      if (entity.FileId !== null && entity.FileId) {
        this.dataService.listById('/upload/profilePicture', entity.FileId).subscribe(res => {
          if (res.body) {
            entity.logo = {};
            entity.logo._id = res.body[0]._id;
            entity.logo.name = res.body[0].name;
            entity.logo.url = res.body[0].url;
          }
          this.dataService.update('/company-profile', entity).subscribe(() => {});
        });
      }
    });
  }

  migrateSignedNdaFromBriefSuppliers(briefSuppliers: any[]) {
    const filteredBriefSuppliers = briefSuppliers.filter(entity => {
      return entity.SignedNdaFileId !== null;
    });
    filteredBriefSuppliers.map(entity => {
      if (entity.SignedNdaFileId) {
        this.dataService.getByIdGuid('/upload', entity.SignedNdaFileId).subscribe(res => {
          entity.SignedNdaFile = {};
          entity.SignedNdaFile._id = res.body[0]._id;
          entity.SignedNdaFile.Name = res.body[0].Name;
          entity.SignedNdaFile.url = res.body[0].url;
          this.dataService.update('/brief-supplier', entity).subscribe(() => {});
        });
      }
    });
  }

  migratePostsIdsFromCollections(collections: any[]) {
    collections.map(entity => {
      this.dataService.listById('/collection-post', entity._id).subscribe(postCollections => {
        entity.postsIds = postCollections.body.map(postCollection => {
          return postCollection.PostId;
        });
        this.dataService.update('/collections', entity).subscribe(() => {});
      });
    });
  }

  migrateImagesAndAttachments(type?: string, entities?: any[]) {
    switch (type) {
      case 'post':
        entities.map(entity => {
          if (entity.Id_GUID) {
            entity.UploadedFiles = [];
            entity.Attachments = [];
            this.dataService
              .listById('/upload', entity._id, 'postImage')
              .toPromise()
              .then(images => {
                images.body.map(file => {
                  if (file.Name === null) {
                    file.Name = 'untitled';
                  }
                  entity.UploadedFiles.push({
                    _id: file._id,
                    Name: file.Name,
                    Order: file.Order,
                    Size: file.Size,
                    url: file.url,
                    Type: file.Name.split('.')
                      .pop()
                      .toLowerCase()
                  });
                });
                this.dataService
                  .listById('/upload', entity._id, 'postAttachment')
                  .toPromise()
                  .then(attachments => {
                    attachments.body.map(file => {
                      if (file.Name === null) {
                        file.Name = 'untitled';
                      }
                      entity.Attachments.push({
                        _id: file._id,
                        Name: file.Name,
                        Order: file.Order,
                        Size: file.Size,
                        url: file.url,
                        Type: file.Name.split('.')
                          .pop()
                          .toLowerCase()
                      });
                    });
                    this.dataService
                      .update('/post', entity)
                      .toPromise()
                      .then(() => {});
                  });
              });
          }
        });
        break;
      case 'brief':
        entities.map(entity => {
          if (entity.Id_GUID) {
            entity.UploadedFiles = [];
            entity.Attachments = [];
            this.dataService
              .listById('/upload', entity._id, 'briefMedia')
              .toPromise()
              .then(images => {
                images.body.map(file => {
                  if (file.Name === null) {
                    file.Name = 'untitled';
                  }
                  entity.UploadedFiles.push({
                    _id: file._id,
                    Name: file.Name,
                    Order: file.Order,
                    Size: file.Size,
                    url: file.url,
                    Type: file.Name.split('.')
                      .pop()
                      .toLowerCase()
                  });
                });
                this.dataService
                  .listById('/upload', entity._id, 'briefAttachment')
                  .toPromise()
                  .then(attachments => {
                    attachments.body.map(file => {
                      if (file.Name === null) {
                        file.Name = 'untitled';
                      }
                      entity.Attachments.push({
                        _id: file._id,
                        Name: file.Name,
                        Order: file.Order,
                        Size: file.Size,
                        url: file.url,
                        Type: file.Name.split('.')
                          .pop()
                          .toLowerCase()
                      });
                    });
                    this.dataService
                      .update('/brief', entity)
                      .toPromise()
                      .then(() => {});
                  });
              });
          }
        });
        break;
    }
  }

  migrateCategoriesFromPosts(posts: IPost[]) {
    this.dataService.listAll('/category-post').subscribe(categoryPosts => {
      posts.map(post => {
        const currentPostCategories = categoryPosts.body.filter(categoryPost => {
          return categoryPost.postId === post._id;
        });
        post.Categories = currentPostCategories.map(categoryPost => {
          return categoryPost.categoryId;
        });
        this.dataService.update('/post', post).subscribe(() => {});
      });
    });
  }

  migrateCompaniesFromPosts(posts: IPost[]) {
    this.dataService.listAll('/post-company').subscribe(postCompanies => {
      posts.map(post => {
        const currentPostCompanies = postCompanies.body.filter(postCompany => {
          return postCompany.PostId === post._id;
        });
        post.RecipientsCompanyProfileId = currentPostCompanies.map(postCompany => {
          return postCompany.CompanyId;
        });
        this.dataService.update('/post', post).subscribe(res => {});
      });
    });
  }

  setImagesDimensions(entities: any[]) {
    entities.map(entity => {
      entity.UploadedFiles.map((file: any) => {
        const image = new Image();
        image.src = this.getResizedUrl(file);
        image.onload = () => {
          file.Width = image.width;
          file.Height = image.height;
          this.dataService.update('/post', entity).subscribe(res => {});
        };
      });
    });
  }

  getResizedUrl(file: any) {
    const container = this.getContainerName(file.url);
    if (container === 'cblx-img') {
      if (file.Type === 'gif') {
        return file.url;
      } else {
        return `${file.url}-SM`;
      }
    } else if (container === 'app-images') {
      const blobName = this.getBlobName(file.url);
      return `https://weleverimages.blob.core.windows.net/${blobName}`;
    }
  }

  getBlobName(url: string) {
    const blobName = url.split('https://weleverimages.blob.core.windows.net/').pop();
    const extension = url.split('.').pop();
    const fileName = blobName.split('.', 1);
    const newBlobName = `${fileName}-SM.${extension}`;
    return newBlobName;
  }

  getContainerName(url: string) {
    return url
      .split('https://weleverimages.blob.core.windows.net/')
      .pop()
      .split('/')[0];
  }

  migrateCategoriesFromBriefs(briefs: IBrief[]) {
    briefs.map(brief => {
      this.dataService.listById('/brief-category', brief._id).subscribe(briefCategories => {
        if (briefCategories.body.length > 0) {
          brief.Categories = briefCategories.body.map(category => {
            return category.categoryId._id;
          });
        }
        this.dataService.update('/brief', brief).subscribe(res => {});
      });
    });
  }

  migrateCompaniesFromBriefs(briefs: IBrief[]) {
    briefs.map(brief => {
      this.dataService.listById('/brief/brief-company', brief._id).subscribe(briefCompanies => {
        if (briefCompanies.body.length > 0) {
          brief.Companies = briefCompanies.body.map(briefCompany => {
            return briefCompany.CompanyId;
          });
        }
        this.dataService.update('/brief', brief).subscribe(res => {});
      });
    });
  }

  async migrateBriefMarketsFromBriefs(briefs: IBrief[]) {
    let markets: any[] = [];
    await this.dataService
      .list('/misc/market-type')
      .toPromise()
      .then(res => {
        markets = res.body;
      });
    briefs.map(brief => {
      this.dataService
        .listById('/brief-market', brief._id)
        .toPromise()
        .then(briefMarkets => {
          if (briefMarkets.body.length > 0) {
            const briefMarketsIds = briefMarkets.body.map(briefMarket => {
              return briefMarket.MarketType;
            });
            const filteredMarkets = markets.filter(market => {
              return briefMarketsIds.indexOf(market.number) !== -1;
            });
            brief.Markets = filteredMarkets.map(market => {
              return market._id;
            });
          }
          this.dataService
            .update('/brief', brief)
            .toPromise()
            .then(res => {});
        });
    });
  }

  flagCblxEntities(type: string) {
    this.dataService
      .listAll(`/${type}`)
      .toPromise()
      .then(res => {
        res.body.map(entity => {
          if (entity.Id_GUID) {
            entity.cblxEntity = true;
            this.dataService
              .update(`/${type}`, entity)
              .toPromise()
              .then(updatedEntity => {});
          }
        });
      });
  }

  async setCblxBriefsToPublished(briefs: any[]) {
    briefs.map(brief => {
      if (brief.Id_GUID) {
        brief.IsDraft = false;
        brief.IsPublished = true;
        this.dataService
          .update('/brief', brief)
          .toPromise()
          .then(respose => {});
      }
    });
  }

  async createCompaniesOrganizations(companies: ICompanyProfile[]) {
    let currentUser: IUser;
    // let companies: ICompanyProfile[];
    let index = 0;
    await this.dataService
      .getUserInfo()
      .toPromise()
      .then(user => {
        currentUser = user.body;
      });

    while (index < companies.length) {
      if (!companies[index].organization) {
        let organizationDomain;
        if (companies[index].Email) {
          organizationDomain = companies[index].Email.split('@')[1];
        } else {
          organizationDomain = 'n/d';
        }
        const organizationName = companies[index].companyName;
        const organization: IOrganization = {
          domain: organizationDomain ? organizationDomain : 'n/d',
          name: organizationName,
          createdBy: currentUser.id
        };
        await this.dataService
          .create('/organization', organization)
          .toPromise()
          .then(organizationRes => {
            companies[index].organization = organizationRes.body._id;
          });
        await this.dataService
          .update('/company-profile', companies[index])
          .toPromise()
          .then(companyRes => {});
      }
      index += 1;
    }
  }

  async removeTestBriefsAndPosts() {
    let posts: any[] = [];
    let briefs: any[] = [];

    await this.dataService
      .listAll('/brief')
      .toPromise()
      .then(res => {
        briefs = res.body.filter(post => {
          return post.cblxEntity !== true;
        });
      });

    await this.dataService
      .listAll('/post')
      .toPromise()
      .then(res => {
        posts = res.body.filter(post => {
          return post.cblxEntity !== true;
        });
      });

    posts.map(post => {
      this.dataService
        .remove('/post', post)
        .toPromise()
        .then(() => {});
    });

    briefs.map(brief => {
      this.dataService
        .remove('/brief', brief)
        .toPromise()
        .then(() => {});
    });
  }

  async removeTestBriefSuppliers() {
    let briefSuppliers: any[] = [];
    await this.dataService
      .listAll('/brief-supplier')
      .toPromise()
      .then(res => {
        briefSuppliers = res.body.filter(briefSupplier => {
          return !briefSupplier.SignedNdaFileId && briefSupplier.SignedNdaFileId !== null;
        });
      });

    briefSuppliers.map(briefSupplier => {
      this.dataService
        .remove('/brief-supplier', briefSupplier)
        .toPromise()
        .then(() => {});
    });
  }

  async setCompaniesNumberOfPosts(companies: ICompanyProfile[]) {
    companies.map(company => {
      this.dataService
        .list('/post', { SupplierId: company._id })
        .toPromise()
        .then(posts => {
          company.numberOfPosts = posts.body.length;
          this.dataService
            .update('/company-profile', company)
            .toPromise()
            .then(updatedCompany => {});
        });
    });
  }

  async migrateJobTitleAndDepartments() {
    let jobTitles: any[] = [];
    let departments: any[] = [];
    await this.dataService
      .list('/misc/job-title')
      .toPromise()
      .then(res => {
        jobTitles = res.body;
      });
    await this.dataService
      .list('/misc/department')
      .toPromise()
      .then(res => {
        departments = res.body;
      });

    this.dataService
      .listAll('/users')
      .toPromise()
      .then(res => {
        res.body.map(user => {
          const currentUser = user;
          const foundJobTitle = jobTitles.find(jobTitle => {
            return jobTitle.number === currentUser.jobTitle;
          });
          const foundDepartment = departments.find(department => {
            return department.number === currentUser.department;
          });
          if (foundJobTitle && foundDepartment) {
            currentUser.jobTitle = foundJobTitle.name;
            currentUser.department = foundDepartment.name;
            this.dataService
              .updateUser('/users', currentUser)
              .toPromise()
              .then(resUser => {});
          }
        });
      });
  }

  async setProspectSolversAsSolverOfAllSolvers(companies: ICompanyProfile[]) {
    let user: any;
    await this.dataService
      .getUserInfo()
      .toPromise()
      .then(res => {
        user = res.body;
      });
    const solvers = companies.filter(company => {
      return company.Type === 1;
    });
    const prospectSolvers = companies.find(company => {
      return (
        company.companyName === '1. Prospect Solvers' || company.companyName === '1. Prospect Solvers with GrowinCo.'
      );
    });
    solvers.map(solver => {
      const companyRelation = new CompanyRelation();
      companyRelation.companyA = solver._id;
      companyRelation.companyB = prospectSolvers._id;
      companyRelation.disabled = false;
      companyRelation.createdBy = user.id;
      companyRelation.updatedBy = user.id;
      this.dataService
        .create('/company-relation', companyRelation)
        .toPromise()
        .then(relation => {});
    });
  }

  async migrateBuToUser() {
    await this.dataService
      .listAll('/users')
      .toPromise()
      .then(users => {
        users.body.forEach(async (user: IUser, index) => {
          if (user.company && (!user.businessUnit || !user.businessUnit.length) && user.email.includes('mdlz.com')) {
            await this.dataService
              .listAll('/businessUnit', { company: user.company._id.toString() })
              .toPromise()
              .then(businessUnits => {
                const buIds = businessUnits.body.map(bu => bu._id);
                if (buIds.length) {
                  user.businessUnit = buIds;
                }
              });
            if (user.businessUnit.length) {
              await this.dataService
                .updateUser('/users', user)
                .toPromise()
                .then(updatedUser => {})
                .catch(err => console.log(err));
            }
          }
        });
      });
  }

  async displayAllNotifications() {
    await this.dataService
      .update('/notification-user/display-all', {})
      .toPromise()
      .then(res => {
        console.log(res);
      });
  }

  async addCompanyTypes() {
    let companyTypes: any[];
    await this.dataService
      .list('/company-type')
      .toPromise()
      .then(res => {
        console.log(res.body);
        companyTypes = res.body;
      });
    const cpgOrganizationsIds = [
      '5fd3ebfd70455b2e4600b81e',
      '5fd3ebfd70455b2e4600b80d',
      '5fd6cd6618393627091861fc',
      '5fd3ebfd70455b2e4600b80f',
      '5fd3ebfd70455b2e4600b818',
      '5fd3ebfd70455b2e4600b81c',
      '5fd3ebfd70455b2e4600b817',
      '5fd3ebfd70455b2e4600b81b',
      '5fd3ebfd70455b2e4600b813',
      '5fd3ebfd70455b2e4600b80e',
      '5fd6cd5a1839362709186096'
    ];
    this.dataService
      .listAll('/company-profile')
      .pipe(
        map((res: any) =>
          res.body.filter((company: any) => {
            const organizationId = company.organization ? company.organization._id : '';
            return cpgOrganizationsIds.includes(organizationId);
          })
        )
      )
      .toPromise()
      .then(companies => {
        companies.map((company: any) => {
          company.type = companyTypes[0]._id;
          this.dataService
            .update('/company-profile', company)
            .toPromise()
            .then(res => {
              console.log(res.body);
            });
        });
      });
  }
}
