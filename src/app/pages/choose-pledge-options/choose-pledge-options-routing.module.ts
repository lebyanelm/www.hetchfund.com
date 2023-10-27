import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChoosePledgeOptionsPage } from './choose-pledge-options.page';

const routes: Routes = [
  {
    path: '',
    component: ChoosePledgeOptionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChoosePledgeOptionsPageRoutingModule {}
