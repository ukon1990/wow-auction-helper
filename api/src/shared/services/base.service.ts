import {BaseRepository} from '../../repository/base.repository';
import {AuthService} from './auth.service';
import {HttpHeaders} from 'aws-sdk/clients/iot';


export abstract class BaseService<T extends unknown, S extends BaseRepository<T>> {
  protected readonly authService: AuthService;
  protected readonly repository: S;
  protected constructor(
    headers: HttpHeaders,
    repository?: S,
  ) {
    this.authService = new AuthService(headers);
    this.repository = repository;
  }
}