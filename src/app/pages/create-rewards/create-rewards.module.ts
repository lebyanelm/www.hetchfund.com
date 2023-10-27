import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateRewardsPageRoutingModule } from './create-rewards-routing.module';

import { CreateRewardsPage } from './create-rewards.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateRewardsPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [CreateRewardsPage],
})
export class CreateRewardsPageModule {}
