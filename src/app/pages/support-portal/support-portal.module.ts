import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SupportPortalPageRoutingModule } from './support-portal-routing.module';

import { SupportPortalPage } from './support-portal.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    SupportPortalPageRoutingModule,
  ],
  declarations: [SupportPortalPage],
})
export class SupportPortalPageModule {}
