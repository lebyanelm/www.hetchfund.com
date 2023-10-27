import { ITimeCreated } from './ITimeCreated';

export interface IComment {
  time_created: ITimeCreated;
  key: string;
  _for: string;
  body: string;
  commentor: ICommentor;
  reply_of: string;

  replies: string[];
  replies_count: number;

  approvals: string[];
  approvals_count: number;

  disaprovals: string[];
  disaprovals_count: number;

  reports: string[];
  reports_count: number;

  is_disqualified: boolean;
  is_edited: boolean;
}

export interface ICommentReport {
  key: string;
  reason: string;
  reporter: string;
}

export interface ICommentor {
  display_name: string;
  email_address: string;
  profile_image: string;
  role: string;
}
