<p align="center"><a href="https://www.verygoodsecurity.com/"><img src="https://vgs-public-image-storage.s3-us-west-2.amazonaws.com/vgs_zero_hero.png" width="512" alt="VGS Logo"></a></p>
<p align="center"><a href="https://www.verygoodsecurity.com/"><img src="https://vgs-public-image-storage.s3-us-west-2.amazonaws.com/vgs_satellite_sputnik.png" width="512" alt="VGS Logo"></a></p>
<p align="center"><b>@vgs/vgs-satellite</b><br/>VGS Offline integration/debugging application.</p>
<p align="center">
<a href="https://circleci.com/gh/verygoodsecurity/vgs-satellite/tree/master"><img src="https://circleci.com/gh/verygoodsecurity/vgs-satellite/tree/master.svg?style=svg" alt="circleci-test"></a>
<a href="https://badge.fury.io/js/%40vgs%2Fvgs-satellite"><img src="https://badge.fury.io/js/%40vgs%2Fvgs-satellite.svg" alt="npm-version"></a>
<a href="https://badge.fury.io/js/%40vgs%2Fvgs-satellite"><img src="https://img.shields.io/npm/dw/@vgs/vgs-satellite?style=flat-square" alt="npm-downloads"></a>
<a href="https://opensource.org/licenses/ISC"><img src="https://img.shields.io/npm/l/@vgs/vgs-satellite?style=flat-square" alt="NPM"></a>
</p>


<!-- toc -->
* [Description](#description)
* [Running from github](#running-from-github)
* [How to run](#how-to-use)
* [Reverse proxy mode](#reverse-proxy-mode)
<!-- tocstop -->

## Description

VGS Satellite is an application that can ease your integration with Very Good Security.
VGS Satellite provides:

    - Demo VGS Vault capabilities
    - Redact/reveal functinality
    - JSON payload request/response transformer
    - Route configuration generator according to specific request
    - Route configuration editor
    - Logging
    - Man-in-the-middle proxy functionality (request incertept/replay/edit/etc)
     
This  application gives you an ability to run requests with your service and transform them into suitable VGS route configuration
without any need to sign up.

## Running from github

1. Clone sources
    ```bash
        git clone git@github.com:verygoodsecurity/vgs-satellite.git && cd vgs-satellite
    ```

1. Create `~/.mitmproxy/config.yaml` configuration file. 
    ```bash
        echo "listen_port: 9099\nweb_port: 8089\nweb_host: localhost\nweb_open_browser: false" > ~/.mitmproxy/config.yaml
    ```
   
    
1. Run application...

    a) ...in browser 
    ```bash
        npm i
        npm start
    ```
    b) ...in electron 
    ```bash
       npm i
       npm run start:app
    ```

## How to use 

_Note: this manual of how to use vgs-satellite assuming you are running from docker-compose_

1. Run application. 
   We assume that content of `.env` wasn't changed
1. Open [http://localhost:1234](http://localhost:1234) or wait for electron application to start
1. Run example requests:
    ```bash
    curl http://httpbin.org/post -k -x localhost:9099 -H "Content-type: application/json" -d '{"foo": "bar"}'
    ```
1. Wait for your requests to appear
   
   ![requests-list](manual/1-requests-list.png)
   
1. Choose your request from the list

   ![requests-detail](manual/2-requests-detail.png)
    
1. Click secure you payload

   ![secure-payload](manual/3-secure-payload.png)
   
1. Check field you would like to secure.

   ![secure-check](manual/4-secure-check.png)

    For additional setting please reference the [nomenclature](https://www.verygoodsecurity.com/docs/terminology/nomenclature)

1. Click `Secure this payload`, then `View route configuration`

   ![route-config](manual/5-route-config.png)
   
1. Switch to `Outbound` and click `Save route`
    
    Your route is now available on `Routes` page. You can edit/delete it or import another one from YAML.
    
    ![routes-page](manual/6-routes.png)
    
1. Re-send request from #3 or navigate to your request on `Requests` and click `Replay`

    ![replay-request](manual/7-replay.png)
    
1. Click on the replayed request and click `Body` tab. You will see that your payload was redacted. 

    ![diff-viewer](manual/8-diffviewer.png)
    
1. Navigate to `Routes` page and click `Manage` on route you saved. Switch `Redact` to `Reveal`.

    ![manage-route](manual/9-manage-route.png)

    Click `Save`

    ![save-route](manual/10-save-route.png)

1. Send request substituting raw payload with aliased one from #11

    ```bash
    curl http://httpbin.org/post -k -x localhost:9099 -H "Content-type: application/json" -d '{"foo": "tok_dev_Q5NGpoZvMiCikwcmKhJtcK"}'
    ```
   
   You will see previously sent raw payload.
   
   
## Reverse proxy mode

VGS Satellite can be run in reverse proxy mode. For this add `mode: reverse:upstream.local` to the end of ~/.mitmproxy/config.yaml.
You would need to run request directly to `localhost:9099` without -x(proxy option) in #3 and #13 