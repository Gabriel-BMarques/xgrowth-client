import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MockService } from '@app/services/mock.service';
import { HeaderService } from '@app/services/header.service';
import { IPost } from '@app/shared/models/post.model';
import { Router, RoutesRecognized, ActivatedRoute } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';
import { DataService } from '@app/services/data.service';
import { ICollection } from '@app/shared/models/collections.model';

@Component({
  selector: 'app-post-sample',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostSampleComponent implements OnInit {
  header: string;
  isLoading = false;
  post: IPost;
  postMock: IPost;
  postId: string;
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };
  skeletonLoading = true;
  previousUrl: string;
  collections: ICollection[];
  posts: IPost[];
  postIds: any[];

  constructor(
    private headerService: HeaderService,
    private mockService: MockService,
    private router: Router,
    private _location: Location,
    private dataService: DataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Post';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Post';
    }

    this.router.events
      .pipe(
        filter((evt: any) => evt instanceof RoutesRecognized),
        pairwise()
      )
      .subscribe((events: RoutesRecognized[]) => {
        this.previousUrl = events[0].urlAfterRedirects;
      });
    this.postId = this.route.snapshot.params.id;
    this.skeletonLoading = true;
    this.dataService
      .listAll('/collections')
      .toPromise()
      .then(collections => {
        this.collections = collections.body;
      });
    this.dataService
      .listAll('/post')
      .toPromise()
      .then(posts => {
        this.posts = posts.body;
      });
    this.dataService
      .find('/post', this.postId)
      .toPromise()
      .then(post => {
        this.post = post.body;
        this.formatUrls(post.body);
      });
    setTimeout(() => {
      // Timeout is being used to simulate database query
      this.postMock = this.mockService.generateItem('post');
      this.skeletonLoading = false;
    }, 2000);
  }

  ionViewWillEnter() {}

  ionViewDidEnter() {
    this.headerService.setHeader(this.header);
    this.isLoading = true;
  }

  public addToCollection(collection?: string) {
    this.collections[0].postsIds = [];
    this.collections[0].postsIds = this.posts.map(post => {
      return post._id;
    });
    this.dataService
      .update('/collections', this.collections[0])
      .toPromise()
      .then(() => {});
  }

  public fallbackImage(i: number) {
    if (this.post.UploadedFiles[i]) {
      this.post.UploadedFiles[i].url = 'https://picsum.photos/id/122/130/160';
      return this.post.UploadedFiles[i].url;
    }
  }

  back() {
    this.router.navigateByUrl(this.previousUrl);
  }

  private formatUrls(post: IPost) {
    Object.entries(post.UploadedFiles).forEach(([key, fileUrl]) => {
      fileUrl.url = this.getThumbnailImage(fileUrl.url);
    });
  }

  private getThumbnailImage(url: string) {
    const image = 'https://weleverimages.blob.core.windows.net/app-images/' + url;
    return image;
  }
}
