import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  state: Subject<boolean> = new Subject<boolean>();
  processes: Subject<boolean[]> = new Subject<boolean[]>();
  _processes = [];
  isPersist = false;

  constructor() {
    // Every 5 seconds check if the processes are loading or not.
    setInterval(() => {
      this.isLoading();
      console.log('Running a process check.');
    }, 10000);
  }
  showLoader() {
    const idx = this.addProcess();
    this.state.next(this.isLoading());
    return idx;
  }

  hideLoader(idx: number) {
    this.removeProcess(idx);
    this.state.next(this.isLoading());
    return this._processes;
  }

  addProcess(timeout: number = 60000) {
    // Create a process with a timestamp to be able to remove the loader incase the process takes long.
    const idx =
      this._processes.push({ state: true, timestamp: Date.now(), timeout }) - 1;
    console.log(this._processes);
    return idx;
  }

  removeProcess(idx: number) {
    this._processes.splice(idx, 1);
    return this._processes;
  }

  isLoading() {
    let loaderStatus = false;
    let now = Date.now();
    for (let i = 0; i <= this._processes.length - 1; i++) {
      if (this._processes[i].state === true) {
        loaderStatus = true;
      } else {
        if (now - this._processes[i].timestamp >= this._processes[i].timeout) {
          // Remove the process because the timeout has been reached.
          this.removeProcess(i);
        } else {
          break;
        }
      }
    }

    return loaderStatus;
  }
}
