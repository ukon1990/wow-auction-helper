import {TSMHandler} from './tsm.handler';
import {environment} from '../../../client/src/environments/environment';

xdescribe('TSMHandler', () => {
  xit('getAndStartAllRealmsToUpdate', async() => {
    jest.setTimeout(900000);
    environment.test = false;
    // await new TSMHandler().getAndStartAllRealmsToUpdate();
    await new TSMHandler().updateRealm(79, 'eu', 'emerald-dream');
    expect(1).toBeTruthy();
  });
});
