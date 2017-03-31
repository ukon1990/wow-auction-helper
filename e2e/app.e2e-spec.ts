import { Ag4Page } from './app.po';

describe('ag4 App', () => {
  let page: Ag4Page;

  beforeEach(() => {
    page = new Ag4Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
