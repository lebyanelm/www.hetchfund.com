import { Injectable, Output } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarMenuService {
  @Output() state: Subject<boolean> = new Subject<boolean>();
  _state: boolean = false;
  constructor() {}

  toggle(state: boolean = undefined) {
    if (state) {
      this._state = state;
    } else {
      this._state = !this._state;
    }

    this.state.next(this._state);
  }
}
