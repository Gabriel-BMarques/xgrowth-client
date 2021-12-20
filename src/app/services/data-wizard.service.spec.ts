import { TestBed } from '@angular/core/testing';

import { DataWizardService } from './data-wizard.service';

describe('DataWizardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataWizardService = TestBed.get(DataWizardService);
    expect(service).toBeTruthy();
  });
});
