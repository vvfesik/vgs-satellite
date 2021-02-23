import * as React from 'react';
import history from 'src/redux/utils/history';
import Code from 'src/components/atoms/Code/Code';
import Card from 'src/components/atoms/Card/Card';
import { Button, Divider, Icon } from 'antd';

interface IHomeProps {}

const Home: React.FC<IHomeProps> = (props) => {
  const reverseCurl = `curl localhost:9098/post -k \\
  -H "Content-type: application/json" \\
  -d '{"credit-card": "4111 1111 1111 1111"}'`;
  const forwardCurl = `curl https://echo.apps.verygood.systems/post -k \\
  -x localhost:9099 \\
  -H "Content-type: application/json" \\
  -d '{"credit-card": "4111 1111 1111 1111"}'`;

  return (
    <Card className='px-3 mb-5'>
      <h1 className='text-text'>Welcome to Satellite</h1>
      <h2 className='text-text'>
        1. To set up reverse proxy / inbound connection
      </h2>
      <ol className='text-text'>
        <li>
          Create an
          <Button
            type='link'
            className='my-0 mx-2 p-0'
            onClick={() => history.push(`/routes/new/inbound`)}
          >
            Inbound Route
          </Button>
          with the preset default upstream
        </li>
        <li>
          Run the following curl and check
          <Button
            type='link'
            className='my-0 mx-2 p-0'
            onClick={() => history.push(`/logs`)}
          >
            Logs
          </Button>
        </li>
        <li>Open request and secure data on the payload</li>
      </ol>
      <div className='d-flex'>
        <img src='./images/reverse.svg' />
        <div data-role='demo-curl' className='ml-5 mt-2'>
          <Code
            language='bash'
            className='copy-sm ant-card-bordered pl-3 pr-5 bg-light'
          >
            {reverseCurl}
          </Code>
        </div>
      </div>
      <h2 className='text-text'>
        2. To set up forward proxy / outbound connection run the following curl
        and secure the data
      </h2>
      <div className='d-flex'>
        <div data-role='demo-curl' className='mr-5'>
          <Code
            language='bash'
            className='copy-sm ant-card-bordered pl-3 pr-5 bg-light'
          >
            {forwardCurl}
          </Code>
        </div>
        <img src='./images/forward.svg' />
      </div>
      <p>
        When you’re ready to go big, promote your routes to the VGS Dashboard.
      </p>
      <Divider />
      <h2 className='text-text'>CI/CD Pipeline</h2>
      <p>
        To use Satellite in your CI/CD-pipelines download{' '}
        <a href='https://hub.docker.com/r/verygood/satellite' target='_blank'>
          Docker image
        </a>
        . The image incorporates the proxy functional (both forward and reverse)
        and the management API. The management API exposes route configuration
        capabilities along with monitoring flow and audit-logs.
      </p>
      <Divider />
      <div className='d-flex align-items-center'>
        <Icon type='aliwangwang' className='mr-2' />
        <p className='mb-0 text-text-light text-sm'>
          Have an idea how we can improve or experiencing an issue? Send us
          feedback at{' '}
          <a href='mailto:satellite@vgs.io' target='_blank'>
            satellite@vgs.io
          </a>
        </p>
      </div>
    </Card>
  );
};

export default Home;
