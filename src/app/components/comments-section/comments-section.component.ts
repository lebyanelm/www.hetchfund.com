import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IComment } from 'src/app/interfaces/IComment';
import { EggService } from 'src/app/services/egg.service';
import { SessionService } from 'src/app/services/session.service';
import { ToastManagerService } from 'src/app/services/toast-manager.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';

@Component({
  selector: 'app-comments-section',
  templateUrl: './comments-section.component.html',
  styleUrls: ['./comments-section.component.scss'],
})
export class CommentsSectionComponent implements OnInit {
  @ViewChild('CommentBodyInput')
  commentBodyInput: ElementRef<HTMLTextAreaElement>;
  @Input() comments: IComment[] = [];
  @Input() pitchKey: string;
  @Input() isDisabled: boolean = false;

  commentBody: string = '';

  isReply: boolean = false;
  replyComment: IComment;

  constructor(
    private sessionService: SessionService,
    private toastService: ToastManagerService,
    private pitchService: EggService
  ) {}
  ngOnInit() {
    this.pitchService
      .getComments(this.pitchKey)
      .then((comments) => (this.comments = comments));
  }

  postComment(commentBody, replyComment: string = undefined) {
    return new Promise((resolve, reject) => {
      superagent
        .post([environment.farmhouse, this.pitchKey, 'comments'].join('/'))
        .send({ body: commentBody, reply_of: replyComment })
        .set(
          'Authorization',
          ['Bearer', this.sessionService.sessionToken].join(' ')
        )
        .end((_, response) => {
          if (response) {
            if (response.statusCode === 200) {
              if (!replyComment) {
                this.comments.push(response.body.data);
                this.commentBody = '';
                this.toastService.show('Comment posted.');
              } else {
                resolve(response.body.data);
              }
            } else {
              this.toastService.show(
                response.body.reason || 'Something went wrong.'
              );
            }
          } else {
            this.toastService.show("You're not connected to the internet.");
          }
        });
    });
  }

  deleteComment(commentId: string, replyComment: string = undefined) {
    return new Promise((resolve, reject) => {
      superagent
        .delete(
          [
            environment.farmhouse,
            this.pitchKey,
            'comments',
            replyComment ? replyComment : commentId,
          ].join('/')
        )
        .set(
          'Authorization',
          ['Bearer', this.sessionService.sessionToken].join(' ')
        )
        .end((_, response) => {
          if (response) {
            if (response.statusCode === 200) {
              if (!replyComment) {
                const commentIndex = this.comments.findIndex(
                  (_comment) => _comment.key === commentId
                );
                if (commentIndex !== -1) {
                  this.comments.splice(commentIndex, 1);
                }
                this.toastService.show('Comment deleted.');
              } else {
                resolve(response.body.data);
              }
            } else {
              this.toastService.show(
                response.body.reason || 'Something went wrong.'
              );
            }
          } else {
            this.toastService.show("You're not connected to the internet.");
          }
        });
    });
  }
}
