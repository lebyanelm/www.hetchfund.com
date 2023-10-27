import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  anchor = document.createElement('a');
  constructor() {}
  route(route: string[], options: any = {}): void {
    // Build the URL.
    this.anchor.href = route.join('/');
    let index = 0;
    for (let name in options) {
      if (index === 0) {
        this.anchor.href += '?';
      } else {
        this.anchor.href += '&';
      }
      this.anchor.href += [name, options[name]].join('=');

      index += 1;
    }

    // Navigate.
    this.anchor.click();
  }
}
