import { Component, Input, OnInit } from '@angular/core';
import { IComment } from 'src/app/interfaces/IComment';
import { EggService } from 'src/app/services/egg.service';
import { SessionService } from 'src/app/services/session.service';
import * as timeago from 'timeago.js';

@Component({
  selector: 'app-comment-action-buttons',
  templateUrl: './comment-action-buttons.component.html',
  styleUrls: ['./comment-action-buttons.component.scss'],
})
export class CommentActionButtonsComponent implements OnInit {
  @Input() data: IComment;
  @Input() toggleCommentReplyBox: any;
  @Input() binder: any;

  commentAge: string;

  constructor(
    public sessionService: SessionService,
    public pitchService: EggService
  ) {}

  ngOnInit() {
    this.commentAge = this.getCommentAge(this.data?.time_created.timestamp);
  }

  addCommentReaction(pitchKey: string, commentKey: string, isLove: boolean) {
    this.pitchService
      .addCommentReaction(pitchKey, commentKey, isLove)
      .then((comment) => {
        this.data = comment;
      });
  }

  openCommentReply() {
    this.toggleCommentReplyBox.bind(this.binder)(this.data);
  }

  getCommentAge(timeCreated: number): string {
    const TO_UTC_TIMESTAMP = 1000;
    return timeago.format(
      new Date(timeCreated * TO_UTC_TIMESTAMP).getTime(),
      'en-ZA'
    );
  }
}
