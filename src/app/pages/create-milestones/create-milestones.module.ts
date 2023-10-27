import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateMilestonesPageRoutingModule } from './create-milestones-routing.module';

import { CreateMilestonesPage } from './create-milestones.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateMilestonesPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [CreateMilestonesPage],
})
export class CreateMilestonesPageModule {}
