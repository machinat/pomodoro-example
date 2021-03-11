import Machinat from '@machinat/core';
import { MachinatNode } from '@machinat/core/types';
import { ACTION_START } from '../constant';
import OneButtonPanel from './OneButtonPanel';

type StopingPanelProps = {
  children: MachinatNode;
};

const StopingPanel = ({ children }: StopingPanelProps, { platform }) => {
  return (
    <OneButtonPanel
      text="Stop"
      action={ACTION_START}
      makeLineAltText={(template) => template.text as string}
    >
      {children}
    </OneButtonPanel>
  );
};

export default StopingPanel;
