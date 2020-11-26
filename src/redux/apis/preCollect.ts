import axios from 'axios';
import config from 'src/config/config';

export const getMitmLogs = () =>
  axios.get(`${config.satelliteApiEndpoint}/flows.json`);

export const replayMitmLog = (logId: string) =>
  axios.post(`${config.satelliteApiEndpoint}/flows/${logId}/replay`);

export const duplicateMitmLog = (logId: string) =>
  axios.post(`${config.satelliteApiEndpoint}/flows/${logId}/duplicate`);

export const deleteMitmLog = (logId: string) =>
  axios.delete(`${config.satelliteApiEndpoint}/flows/${logId}`);

export const updateMitmLog = (logId: string, payload: any) =>
  axios.put(`${config.satelliteApiEndpoint}/flows/${logId}`, payload);
