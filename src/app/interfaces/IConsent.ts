export interface IConsent {
  title: string;
  description: string;
  options: IConsentOption[];
}

export interface IConsentOption {
  name: string;
  return: boolean | any;
}
