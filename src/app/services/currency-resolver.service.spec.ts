import { TestBed } from '@angular/core/testing';

import { CurrencyResolverService } from './currency-resolver.service';

describe('CurrencyResolverService', () => {
  let service: CurrencyResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrencyResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
