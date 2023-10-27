import { IMilestone } from './IMilestone';
import { ITimeCreated } from './ITimeCreated';

export interface IEgg {
  _id?: string;
  key?: string;

  time_created?: ITimeCreated;
  funding_until?: ITimeCreated;
  approval_date?: ITimeCreated;

  curator?: string;
  other_curators?: string;
  name?: string;

  ending_timestamp?: number;

  is_none_end?: boolean;
  is_hetch_favourite?: boolean;
  is_approved?: boolean;
  is_funded?: boolean;
  is_draft?: boolean;
  status?: string;

  hetching_goal?: number;
  pitch_period?: number;
  hetched_funds?: number;
  hetched_funds_perc?: number;
  funds_left?: number;
  funds_left_perc?: number;
  hetchers?: string[];
  country_published?: string;
  province_published?: string;
  finances?: IFinanceCosts;

  brief_description?: string;
  milestones?: IMilestone[];
  story?: any;
  presentation_video?: string;
  thumbnail_url?: string;
  primary_category?: string;
  secondary_category?: string;
  comments?: string[];
  faqs?: any[];
  bookmarks?: string[];
  funding_purpose?: string;
  tags?: string[];

  // For sole purposes of drafts:
  review_documents?: {
    company_documentations: any;
    director_documentations: any;
  };
  draft_progress?: {
    basic?: DraftProgress;
    story?: DraftProgress;
    finances?: DraftProgress;
    rewards?: DraftProgress;
    curators?: DraftProgress;
    milestones?: DraftProgress;
    documentation?: DraftProgress;
    review?: DraftProgress;
  };
}

export interface DraftProgress {
  required: boolean;
  value: boolean;
}

export interface IFinanceCost {
  amount?: string;
  date_fullfilled?: number;
}

export interface IFinanceCosts {
  design_and_prototype?: IFinanceCost;
  regulatory_compliance?: IFinanceCost;
  development?: IFinanceCost;
  testing?: IFinanceCost;
  professional_fees?: IFinanceCost;
  final_development?: IFinanceCost;
  reward_fulfullment?: IFinanceCost;
}

export interface IStoryData {
  time: number;
  blocks: IStoryDataBlock[];
}

export interface IStoryDataBlock {
  id: string;
  type: string;
  data: {
    text: string;
    level?: number;
    url?: string;
    mimetype?: string;
    uploader_id?: string;
  };
}
