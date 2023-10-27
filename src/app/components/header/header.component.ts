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

  isSessionActive = false;
  isUnableToLoadCurrencies = false;

  constructor(
    public sessionService: SessionService,
    public currencyService: CurrencyResolverService,
    public sidebarService: SidebarMenuService
  ) {}

  ngOnInit() {
    this.sessionService.sessionDataSubject.subscribe(() => {
      this.isSessionActive = true;
    });
  }

  ngAfterViewInit(): void {
    window.onscroll = (event) => {
      console.log(event);
    };
  }

  // @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event) {
    const verticalOffset =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    console.log(verticalOffset);
  }
}
