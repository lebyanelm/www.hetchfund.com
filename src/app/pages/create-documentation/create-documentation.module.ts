import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateDocumentationPageRoutingModule } from './create-documentation-routing.module';

import { CreateDocumentationPage } from './create-documentation.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateDocumentationPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [CreateDocumentationPage],
})
export class CreateDocumentationPageModule {}
