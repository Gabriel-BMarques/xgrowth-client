import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { BriefsGuard } from './mybrief.guard';

describe('BriefsGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BriefsGuard]
    });
  });

  it('should ...', inject([BriefsGuard], (guard: BriefsGuard) => {
    expect(guard).toBeTruthy();
  }));
});
