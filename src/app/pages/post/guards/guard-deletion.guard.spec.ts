import { TestBed } from '@angular/core/testing';

import { GuardDeletionGuard } from './guard-deletion.guard';

describe('GuardDeletionGuard', () => {
  let guard: GuardDeletionGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GuardDeletionGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
