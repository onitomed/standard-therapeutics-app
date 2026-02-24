import { TestBed } from '@angular/core/testing';

import { SelectpatientService } from './selectpatient.service';

describe('SelectpatientService', () => {
  let service: SelectpatientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectpatientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
