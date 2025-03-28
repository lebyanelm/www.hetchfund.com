import { Injectable } from '@angular/core';
import { Subject, interval } from 'rxjs';
import * as nanoid from 'nanoid';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  state: Subject<boolean> = new Subject<boolean>();
  processes: Subject<boolean[]> = new Subject<boolean[]>();
  _processes = [];
  isPersist = false;

  constructor() { }

  // Every 120 seconds check if the processes are loading or not.
  createLoaderChecker() {
    let checkLoaderCompleteness: any = setInterval(() => {
      const isLoading = this.isLoading();
      console.log("Loader status:", isLoading)
      // For memory purposes stop the interval once all loaders are completed.
      if (!isLoading) {
        clearInterval(checkLoaderCompleteness);
        checkLoaderCompleteness = null;
      }
    }, 10000);
  }

  showLoader() {
    const idx = this.addProcess();
    this.state.next(this.isLoading());
    console.log(this._processes)
    return idx;
  }

  hideLoader(idx: string) {
    this.removeProcess(idx);
    this.state.next(this.isLoading());
    console.log(this._processes)
    return this._processes;
  }

  addProcess(timeout: number = 6000) {
    // Create a process with a timestamp to be able to remove the loader incase the process takes long.
    const idx = nanoid.nanoid();
    this._processes.push({ state: true, timestamp: Date.now(), timeout, idx });
    this.createLoaderChecker();
    return idx;
  }

  removeProcess(idx: string) {
    const processIndex = this._processes.findIndex((process) => process.idx === idx);
    this._processes.splice(processIndex, 1);
    this.createLoaderChecker();
    return this._processes;
  }

  isLoading() {
    let loaderStatus = false;
    let now = Date.now();
    for (let i = 0; i <= this._processes.length - 1; i++) {
      console.log(this._processes[i])
      if (this._processes[i].state === true) {
        loaderStatus = true;
        
        console.log(now - this._processes[i].timestamp >= this._processes[i].timeout)
        if (now - this._processes[i].timestamp >= this._processes[i].timeout) {
          // Remove the process because the timeout has been reached.
          this.removeProcess(this._processes[i].idx);
        }
        break;
      }
    }

    if (loaderStatus == false) {
      this.state.next(loaderStatus);
    }
    return loaderStatus;
  }
}
