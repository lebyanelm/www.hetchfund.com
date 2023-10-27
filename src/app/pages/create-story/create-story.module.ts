import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateStoryPageRoutingModule } from './create-story-routing.module';

import { CreateStoryPage } from './create-story.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    CreateStoryPageRoutingModule,
  ],
  declarations: [CreateStoryPage],
})
export class CreateStoryPageModule {}
