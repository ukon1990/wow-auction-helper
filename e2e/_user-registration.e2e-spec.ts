/**
 * Shall contain different user registration scenarios
 */
import { PagePage } from './page.po';

describe('wah App', () => {
  let page: PagePage;

  beforeEach(() => {
    page = new PagePage();
    page.sleep(1000);
  });

  it('Should be able to register', () => {
    page.getElementContainingText('button', 'Lets get started').click();

    /**
     * Realm and region selection
     */
    page.getInputByPlaceholder('Region').click();
    page.getElementContainingText('mat-option', 'Europe').click();
    // Waiting for realms to download
    page.sleep(1000);
    page.getInputByPlaceholder('Realm').click();
    page.getElementContainingText('mat-option', 'Draenor').click();
    page.getElementContainingText('button', 'Add crafters/characters').click();

    /**
     * Adding characters
     */
    page.getInputByPlaceholder('Character').sendKeys('Stinsøn');
    page.getElementContainingText('button', 'Add').click();
    page.sleep(500);
    expect(page.getElementContainingText('mat-card-title', 'Stinsøn')).toBeTruthy();
  });
});
