import { customAttribute, inject } from 'aurelia-framework';

@customAttribute('allowed-keys')
@inject(Element)
export class AllowedChars {
  constructor(element) {
    this.element = element;

    this.enterPressed = e => {
      const key = e.key;
      if (!(this.value && this.value.includes(key))) {
        e.preventDefault();
        this.element.dispatchEvent(new Event('disallowed-key'));
        return;
      }
    };
  }

  attached() {
    this.element.addEventListener('keypress', this.enterPressed);
  }

  detached() {
    this.element.removeEventListener('keypress', this.enterPressed);
  }
}

