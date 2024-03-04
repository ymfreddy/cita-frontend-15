import { TestBed } from '@angular/core/testing';

import { SfeService } from './sfe.service';

describe('SfeService', () => {
  let service: SfeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SfeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
