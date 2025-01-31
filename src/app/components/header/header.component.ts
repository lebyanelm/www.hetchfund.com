import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ICurrency } from 'src/app/interfaces/ICurrency';
import { IHetcher } from 'src/app/interfaces/IHetcher';
import { CurrencyResolverService } from 'src/app/services/currency-resolver.service';
import { SessionService } from 'src/app/services/session.service';
import { SidebarMenuService } from 'src/app/services/sidebar-menu.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, AfterViewInit {
  @ViewChild('CurrencyDropdownAnchor')
  currencyDropdownAnchor: ElementRef<HTMLAnchorElement>;
  @ViewChild('ProfileDropdownAnchor')
  profileDropdownAnchor: ElementRef<HTMLAnchorElement>;
  @Input() hasBackground = true;
  @Input() highlightHeader: string;

  isShownVerificationAlert = false;
  isSessionActive = false;
  isUnableToLoadCurrencies = false;

  constructor(
    public sessionService: SessionService,
    public currencyService: CurrencyResolverService,
    public sidebarService: SidebarMenuService,
    private toastService: ToastManagerService
  ) {
    this.sessionService.sessionDataSubject.subscribe(() => {
      this.isSessionActive = true;
      this.isShownVerificationAlert = this.sessionService.data?.kyc_status === "unverified";
    });
  }

  ngOnInit() {
    
  }

  ngAfterViewInit(): void {
    window.onscroll = (event) => {
      console.log(event);
    };
  }

  startVerification() {
    this.sessionService.startRealPersonVerification();
  }

  supresssKycFlow() {
    this.sessionService.suppressRealPersonVerification();
  }
}
