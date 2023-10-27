import { Component, Input, OnInit } from '@angular/core';
import { IMilestone } from 'src/app/interfaces/IMilestone';

@Component({
  selector: 'app-milestones-band',
  templateUrl: './milestones-band.component.html',
  styleUrls: ['./milestones-band.component.scss'],
})
export class MilestonesBandComponent implements OnInit {
  @Input() milestones: IMilestone[] = [];
  @Input() pitchKey: string;

  constructor() {}

  ngOnInit() {}
}
