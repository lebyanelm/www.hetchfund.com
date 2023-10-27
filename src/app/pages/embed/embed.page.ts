import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IEgg } from 'src/app/interfaces/IEgg';
import { EggService } from 'src/app/services/egg.service';
import { RouterService } from 'src/app/services/router.service';

@Component({
  selector: 'app-embed',
  templateUrl: './embed.page.html',
  styleUrls: ['./embed.page.scss'],
})
export class EmbedPage implements OnInit {
  private pitch_key: string;
  public pitch_data: IEgg;

  constructor(
    private activatedRoute: ActivatedRoute,
    private routerService: RouterService,
    private pitchService: EggService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      this.pitch_key = paramMap.get('contract_key');
      if (this.pitch_key) {
        this.pitchService.get(this.pitch_key).then((pitch: IEgg) => {
          if (pitch) {
            this.pitch_data = pitch;
          } else {
            this.routerService.route(['errors', '404?embedded=true']);
          }
        });
      } else {
        this.routerService.route(['errors', '400']);
      }
    });
  }
}
