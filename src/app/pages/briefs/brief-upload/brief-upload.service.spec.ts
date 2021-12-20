import { TestBed } from '@angular/core/testing';

import { BriefUploadService } from './brief-upload.service';

describe('BriefUploadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BriefUploadService = TestBed.get(BriefUploadService);
    expect(service).toBeTruthy();
  });
});
