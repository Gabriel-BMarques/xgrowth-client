import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PostSampleComponent } from './post.component';

describe('PostSampleComponent', () => {
  let component: PostSampleComponent;
  let fixture: ComponentFixture<PostSampleComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PostSampleComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PostSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
