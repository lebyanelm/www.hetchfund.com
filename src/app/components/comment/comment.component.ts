import { Component, Input, OnInit } from '@angular/core';
import { IComment } from 'src/app/interfaces/IComment';
import { CommentsSectionComponent } from '../comments-section/comments-section.component';
import { SessionService } from 'src/app/services/session.service';
import { EggService } from 'src/app/services/egg.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit {
  @Input() data: IComment;
  @Input() postCommentMethod: any;
  @Input() deleteMethod: any;
  @Input() binder: CommentsSectionComponent;
  @Input() isDisabled: boolean = false;

  replies: IComment[] = [];
  isRepliesToggled = false;
  fromReply: string;

  replyComment: IComment = null;
  isReplyEnabled: boolean = false;
  commentReplyBody = '';

  constructor(
    public sessionService: SessionService,
    private pitchService: EggService,
    private toastService: ToastManagerService
  ) {}

  ngOnInit() {
    if (this.data) {
      if (this.data?.replies.length) {
        this.fromReply = this.data?.replies[0];
      }
    }
  }

  deleteComment(commentId: string, replyId: string) {
    this.deleteMethod
      .bind(this.binder)(commentId, replyId)
      .then((_) => {
        const replyIndex = this.replies.findIndex(
          (reply) => reply.key === replyId
        );
        alert('Reply index: ' + replyIndex);
        if (replyIndex != -1) {
          this.replies.splice(replyIndex, 1);
          this.toastService.show('Reply deleted.');
        }
      });
  }

  loadReplies() {
    this.isRepliesToggled = !this.isRepliesToggled;
    if (
      this.isRepliesToggled &&
      this.replies.length !== this.data?.replies.length
    ) {
      this.pitchService
        .getCommentReplies(this.data?._for, this.data?.key, this.fromReply)
        .then((replies: IComment[]) => {
          this.replies.push(...replies);

          // TODO: Set the next from reply.
        });
    }
  }

  postReplyComment() {
    this.postCommentMethod
      .bind(this.binder)(this.commentReplyBody, this.data?.key)
      .then((replyComment) => {
        this.commentReplyBody = '';
        this.replies.push(replyComment);
      });
  }
}
