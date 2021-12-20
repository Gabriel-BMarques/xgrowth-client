import { TestBed } from '@angular/core/testing';

import { InterestsGuard } from './interests.guard';

describe('InterestsGuard', () => {
  let guard: InterestsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(InterestsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
