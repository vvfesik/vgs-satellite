import * as React from 'react';

interface IFlowNavProps {
  active: string;
  tabs: string[];
  onSelectTab: (tab: string) => void;
}

const FlowNav: React.SFC<IFlowNavProps> = ({ active, tabs, onSelectTab }) => {
  return (
    <nav className="nav-tabs nav-tabs-sm">
      {tabs.map(tab => (
        <a
          key={tab}
          href="#"
          className={active === tab ? 'active capitalize' : 'capitalize'}
          data-role={`tab-${tab}`}
          onClick={(event) => {
            event.preventDefault();
            onSelectTab(tab);
          }}
        >
          {tab}
        </a>
      ))}
    </nav>
  );
};

export default FlowNav;
