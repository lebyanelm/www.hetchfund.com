import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContributionCompletedPageRoutingModule } from './contribution-completed-routing.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { ContributionCompletedPage } from './contribution-completed.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    ContributionCompletedPageRoutingModule,
  ],
  declarations: [ContributionCompletedPage],
  exports: [],
})
export class ContributionCompletedPageModule {}
