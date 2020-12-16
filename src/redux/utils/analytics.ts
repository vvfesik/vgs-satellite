import config from 'src/config/config';

export const initAnalytics = () => {
  if (config.heapTrackingId) {
    // eslint-disable-next-line
    window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a);for(var n=function(e){return function(){heap && heap.push && heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],o=0;o<p.length;o++)heap[p[o]]=n(p[o])};
    window.heap.load(config.heapTrackingId);
  }
}

export const pushEvent = (eventName: string, eventProps?: { [key: string]: string }) => {
  window.heap?.track(eventName, eventProps || null);
};
