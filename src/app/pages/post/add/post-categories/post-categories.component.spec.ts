import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PostCategoriesComponent } from './post-categories.component';

describe('PostCategoriesComponent', () => {
  let component: PostCategoriesComponent;
  let fixture: ComponentFixture<PostCategoriesComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PostCategoriesComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PostCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
