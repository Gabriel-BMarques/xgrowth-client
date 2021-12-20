import { TestBed } from '@angular/core/testing';

import { MassDownloadService } from './mass-download.service';

describe('MassDownloadService', () => {
  let service: MassDownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MassDownloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
