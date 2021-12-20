import { TestBed } from '@angular/core/testing';

import { MassUploadService } from './mass-upload.service';

describe('MassUploadService', () => {
  let service: MassUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MassUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
