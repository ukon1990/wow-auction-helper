import { browser, by, element, $ } from 'protractor';

export class PagePage {
  navigateTo(path: string) {
    return browser.get(path);
  }

  getElementContainingText(selector: string, text: string) {
    return element(by.cssContainingText(selector, text));
  }
  getInputByPlaceholder(placeholder: string) {
    return $(`input[placeholder="${placeholder}"]`);
  }

  sleep(time: number) {
    browser.sleep(time);
  }
}
