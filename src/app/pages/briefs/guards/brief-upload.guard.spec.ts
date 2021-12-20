import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { BriefUploadGuard } from './brief-upload.guard';

describe('BriefUploadGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BriefUploadGuard]
    });
  });

  it('should ...', inject([BriefUploadGuard], (guard: BriefUploadGuard) => {
    expect(guard).toBeTruthy();
  }));
});
