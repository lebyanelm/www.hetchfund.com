import { ITimeCreated } from './ITimeCreated';

export interface IPaymentResponse {
  // Managed by the processor.
  id: string;
  buildNumber: string;
  timestamp: string;
  ndc: string;
  card: {
    bin: string;
    last4Digits: string;
    holder: string;
    expiryMonth: string;
    expiryYear: string;
  };
  customParameters: {
    'OPP_card.bin': string;
  };
  registrationId: string;
  result: {
    code: string;
    description: string;
  };
  standingInstruction: {
    mode: string;
    source: string;
    type: string;
  };
  redirect: {
    parameters: IPaymentResponseParameter[];
    preconditions: IPaymentResponsePrecondition[];
    url: string;
  };

  // Managed in-house.
  key: string;
  time_created: ITimeCreated;
  last_modified: ITimeCreated;
  cvv: string;
  exp_month: string;
  holder: string;
  number: string;
  is_default: boolean;
  is_ready: boolean;
  owner: string;
  paymentBrand: string;
  paymentType: string;
  related_payments: string[];
  _selected_database_: string;
}

export interface IPaymentResponseParameter {
  name: string;
  value: string;
}

export interface IPaymentResponsePrecondition {
  description: string;
  method: string;
  origin: string;
  parameters: IPaymentResponseParameter[];
  preconditionParameters: IPaymentResponseParameter;
  url: string;
  waitUntil: string;
}
