import Machinat, { MachinatNode } from '@machinat/core';
import { ACTION_OK } from '../constant';
import OneButtonPanel from './OneButtonPanel';

type StopingPanelProps = {
  children: MachinatNode;
};

const StopingPanel = ({ children }: StopingPanelProps) => {
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
