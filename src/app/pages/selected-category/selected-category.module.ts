import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectedCategoryPageRoutingModule } from './selected-category-routing.module';

import { SelectedCategoryPage } from './selected-category.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectedCategoryPageRoutingModule,
    ComponentsModule
  ],
  declarations: [SelectedCategoryPage]
})
export class SelectedCategoryPageModule {}
