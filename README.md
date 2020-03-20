@vgs/vgs-satellite
==================

VGS Offline integration project.


<!-- toc -->
* [Running from github](#running-from-github)
* [Node Package Manager](#node-package-manager)
* [How to run](#how-to-use)
* [Mitmproxy script](#mitmproxy-additional-script)
<!-- tocstop -->


## Running from github
_See code [here](https://github.com/verygoodsecurity/vgs-satellite)_


1. Install dependencies:
    ```bash
    npm install
    ```

1. Then run project:

    ```bash
    npm run start
    ```

1. Then open [http://localhost:1234](http://localhost:1234) in your browser


## Building and running via docker-compose

1. Create or use `.env` file inside project root

    Environment variables in `.env`:
    - `PROXY_PORT` - port to run mitmproxy on
    - `WEB_PORT` - port to run mitmproxy web UI on
    - `SATELLITE_PORT` - port to run vgs-satellite web UI on
    - `MITM_DIR` - directory that would be mapped inside containers to store mitmproxy intercepted requests
    - `MITM_ARGS` - additional mitmproxy args (e.g. - "--mode reverse:http://localhost:8080/", empty by default)
    
1. Run project

    ```bash
   docker-compose up 
   ```
   

_Note: mitmproxy in docker-compose is being run with custom script to save har-json representation of requests/response pair in folder on fly. 
If you rum mitmproxy separately, use the following command:_

```bash
mitmweb -s script/mitm-requests-json.py
``` 

## Node package manager
_See package on [npm](https://www.npmjs.com/package/@vgs/vgs-satellite)_

```sh-session
$ npm install -g @vgs/vgs-satellite
running command...
$ vgs-satellite 
```

## How to use 

_Note: this manual of how to use vgs-satellite assuming you are running from docker-compose_

1. Run project. See:  [Building and running via docker-compose](#Building and running via docker-compose)
   We assume that content of `.env` wasn't changed
1. Run example requests:
    ```bash
    curl -H "Content-Type: application/json" -x http://localhost:1230 http://httpbin.org/post -d '{"foo": "bar"}'
    ```
1. Open [http://localhost:1234](http://localhost:1234)
1. Wait for your requests to appear or add your HAR file by clicking `Upload HAR file(s)`

   _Note: you can find HAR file of your requests in /path/to/vgs-satallite/mitm-requests_
   
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
   
1. Download inbound/outbound route and reference instructions provided to import your first route on VGS Dashboard!

## Mitmproxy additional script

Mitmproxy script is available [here](https://github.com/verygoodsecurity/vgs-satellite/blob/master/script/mitm-requests-json.py)