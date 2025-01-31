import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { LoaderService } from './services/loader.service';
import { TitleService } from './services/title.service';
import { ToastManagerService } from './services/toast-manager.service';
import { SidebarMenuService } from './services/sidebar-menu.service';
import { SessionService } from './services/session.service';
import { RouterService } from './services/router.service';
import { SettingsService } from './services/settings.service';
import { ActivatedRoute } from '@angular/router';
import { IdentityVerificationModalComponent } from './components/identity-verification-modal/identity-verification-modal.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  isLoaderShown = false;
  isSidebarShown = false;
  isMobileDevice =
    /Android|iPhone/i.test(navigator.userAgent) ||
    'ontouchstart' in document.documentElement ||
    typeof window.orientation !== 'undefined' ||
    window.matchMedia('only screen and (max-width: 768px)').matches;
  constructor(
    private loaderService: LoaderService,
    private titleService: TitleService,
    private title: Title,
    private routerService: RouterService,
    public toastManager: ToastManagerService,
    public sidebarService: SidebarMenuService,
    public sessionService: SessionService,
    public settingsService: SettingsService,
    public activatedRoute: ActivatedRoute
  ) {
    this.isLoaderShown = this.loaderService.isLoading();
    this.loaderService.state.subscribe((state) => (this.isLoaderShown = state));
    this.titleService.onTitleChange.subscribe((title) =>
      this.title.setTitle(title)
    );

    this.sidebarService.state.subscribe((state) => {
      console.log('Sidebar', state);
      this.isSidebarShown = state;
    });
  }

  ngOnInit(): void {
  }

  signout() {
    this.sessionService.removeSession();
    this.routerService.route(['signin?ref=signout']);
  }

  closeSidebar() {
    this.sidebarService.state.next(false);
  }

  removeToastMessage(tmId: string): void {
    const tmIndex = this.toastManager.currentMessages.findIndex(tm => tm.id === tmId);
    if (tmIndex > -1) {
      this.toastManager.currentMessages.splice(tmIndex, 1);
    }
    return;
  } 
}
