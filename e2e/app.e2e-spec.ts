import { WahPage } from './app.po';

describe('wah App', function() {
  let page: WahPage;

  beforeEach(() => {
    page = new WahPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
