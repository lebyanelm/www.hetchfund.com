import { Injectable } from '@angular/core';
import { ToastManagerService } from './toast-manager.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  state = false;

  constructor(private toastManager: ToastManagerService) {}
}
