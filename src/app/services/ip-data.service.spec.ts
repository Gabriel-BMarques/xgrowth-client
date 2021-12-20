import { TestBed } from '@angular/core/testing';

import { IpDataService } from './ip-data.service';

describe('IpDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IpDataService = TestBed.get(IpDataService);
    expect(service).toBeTruthy();
  });
});
