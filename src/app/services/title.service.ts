import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  onTitleChange: Subject<string> = new Subject<string>();
  constructor() {}
}
