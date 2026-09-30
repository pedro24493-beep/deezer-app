import { TestBed } from '@angular/core/testing';
import { DeezerService } from './deezer';

describe('DeezerService', () => {
  let service: DeezerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeezerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});