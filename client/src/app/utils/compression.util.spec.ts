import {TestBed} from '@angular/core/testing';
import {Compression} from './compression.util';
import {FileService} from '../services/file.service';

describe('Compression', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileService]
    });
  });

  describe('decompress', () => {
    it('Should be able to decompress regular english text', () => {
      const sourceObject = {
        owner: 'Andromeda',
        ownerRealm: 'Aegwyn'
      }, base64 = 'H4sIAAAAAAAAE6tWyi/PSy1SslJyzEspys9NTUlU0oGIBaUm5uSCJFLTyyvzlGoBHK9a9ysAAAA=';
      expect(Compression.decompress(base64).owner).toBe(sourceObject.owner);
    });

    it('Should be able to decompress regular norwegian text', () => {
      const sourceObject = {
        owner: 'ØåæÒäÿç',
        ownerRealm: 'Aegwyn'
      }, base64 = 'H4sIAAAAAAAAE6tWyi/PSy1SslI6POPw0sPLDk86vOTw/sPLlXQgEkGpiTm5QFnH1PTyyjylWgByBvPcMAAAAA==';
      expect(Compression.decompress(base64).owner).toBe(sourceObject.owner);
    });
  });
});
