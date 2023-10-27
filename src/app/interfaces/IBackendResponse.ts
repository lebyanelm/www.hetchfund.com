export interface IBackendResponse<T> {
  data: T;
  pod: string;
  status_code: string;
  status_message: string;
  reason: string;
}
