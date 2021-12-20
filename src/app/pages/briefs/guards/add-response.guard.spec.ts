import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { AddResponseGuard } from './add-response.guard';

describe('AddResponseGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AddResponseGuard]
    });
  });

  it('should ...', inject([AddResponseGuard], (guard: AddResponseGuard) => {
    expect(guard).toBeTruthy();
  }));
});
