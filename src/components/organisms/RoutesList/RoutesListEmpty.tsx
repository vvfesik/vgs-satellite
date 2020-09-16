import React from 'react';
import ImportFromYamlContainer from 'src/components/organisms/ImportFromYaml/ImportFromYamlContainer';

const RouteListEmpty: React.FC = (props) => {
  return (
    <div className='row justify-content-center mx-3'>
      <div className='col d-flex justify-content-center align-self-center text-muted'>
        There are currently no routes.
      </div>
      <ImportFromYamlContainer />
    </div>
  );
};
export default RouteListEmpty;
