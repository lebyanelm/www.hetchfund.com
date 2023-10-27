import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateContributionsPageRoutingModule } from './create-contributions-routing.module';

import { CreateContributionsPage } from './create-contributions.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    CreateContributionsPageRoutingModule,
  ],
  declarations: [CreateContributionsPage],
})
export class CreateContributionsPageModule {}
