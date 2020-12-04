export interface IEventLog {
  flow_id: string;
  proxy_mode: string;
  timestamp: number,
  type: string;
  bytes?: number;
  method?: string;
  label?: string;
  status_code?: number;
  upstream?: string;
  uri?: string;
}
