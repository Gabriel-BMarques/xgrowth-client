import { TestBed } from '@angular/core/testing';

import { PostAddWizardService } from './post-add-wizard.service';

describe('PostAddWizardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PostAddWizardService = TestBed.get(PostAddWizardService);
    expect(service).toBeTruthy();
  });
});
