import Machinat from '@machinat/core';
import { MachinatNode } from '@machinat/core/types';
import { ACTION_OK } from '../constant';
import OneButtonPanel from './OneButtonPanel';

type StopingPanelProps = {
  children: MachinatNode;
};

const StopingPanel = ({ children }: StopingPanelProps, { platform }) => {
  return (
    <OneButtonPanel
      text="Yes"
      action={ACTION_OK}
      makeLineAltText={(template) => template.text as string}
    >
      {children}
    </OneButtonPanel>
  );
};

export default StopingPanel;
