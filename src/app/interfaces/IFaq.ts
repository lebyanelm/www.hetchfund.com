import { ICommentor } from './IComment';

export interface IFaq {
  id: string;
  question: string;
  answer: string;
  added_by: ICommentor;
}
