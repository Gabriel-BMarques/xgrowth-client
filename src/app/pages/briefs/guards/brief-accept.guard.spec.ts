import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { BriefAcceptGuard } from './brief-accept.guard';

describe('BriefAcceptGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BriefAcceptGuard]
    });
  });

  it('should ...', inject([BriefAcceptGuard], (guard: BriefAcceptGuard) => {
    expect(guard).toBeTruthy();
  }));
});
