import Machinat, { MachinatNode } from '@machinat/core';
import { ACTION_START } from '../constant';
import OneButtonPanel from './OneButtonPanel';

type StartingPanelProps = {
  children: MachinatNode;
};

const StartingPanel = ({ children }: StartingPanelProps) => {
  return (
    <OneButtonPanel
      text="Start ▶️ "
      action={ACTION_START}
      makeLineAltText={(template) =>
        `${template.text}\n\nTell me to "Start" when you ar ready`
      }
    >
      {children}
    </OneButtonPanel>
  );
};

export default StartingPanel;
