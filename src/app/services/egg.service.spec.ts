import { TestBed } from '@angular/core/testing';

import { EggService } from './egg.service';

describe('EggService', () => {
  let service: EggService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EggService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
