import axios from 'axios';
import config from 'src/config/config';

export const getEventLogs = (flowId: string) =>
  axios.get(`${config.satelliteApiEndpoint}/logs/${flowId}`);
