import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateCuratorsPageRoutingModule } from './create-curators-routing.module';

import { CreateCuratorsPage } from './create-curators.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    CreateCuratorsPageRoutingModule,
  ],
  declarations: [CreateCuratorsPage],
})
export class CreateCuratorsPageModule {}
