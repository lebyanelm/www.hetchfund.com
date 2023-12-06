import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import {
  SocialLoginModule,
  SocialAuthServiceConfig,
  SocialAuthService,
} from '@abacritt/angularx-social-login';
import {
  GoogleLoginProvider,
  FacebookLoginProvider,
} from '@abacritt/angularx-social-login';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CurrencyPipe } from './pipes/currency.pipe';
import { SessionService } from './services/session.service';
import { ComponentsModule } from './components/components.module';
import { LoaderService } from './services/loader.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Material modules.
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from 'src/environments/environment';
import { SidebarMenuService } from './services/sidebar-menu.service';
import { SettingsService } from './services/settings.service';
import { ToastManagerService } from './services/toast-manager.service';
import { CurrencyResolverService } from './services/currency-resolver.service';
import { SafePipeModule } from 'safe-pipe';

@NgModule({
  declarations: [AppComponent, CurrencyPipe],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatTooltipModule,
    SocialLoginModule,
    ComponentsModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.GOOGLE_CLIENT_ID),
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(environment.FACEBOOK_CLIENT_ID),
          },
        ],
        onError: (err) => {
          console.error(err);
        },
      } as SocialAuthServiceConfig,
    },
    SessionService,
    LoaderService,
    SidebarMenuService,
    ToastManagerService,
    SettingsService,
    CurrencyResolverService,
    SocialAuthService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
