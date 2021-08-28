import Machinat, { MachinatNode } from '@machinat/core';

import { ACTION_PAUSE, ACTION_SKIP } from '../constant';
import TwoButtonPanel from './TwoButtonPanel';

type TimingPanelProps = {
  children: MachinatNode;
};

const SKIP = 'Skip ⏹';
const PAUSE = 'Pause ⏸️';

const TimingPanel = ({ children }: TimingPanelProps) => {
  return (
    <TwoButtonPanel
      text1={PAUSE}
      action1={ACTION_PAUSE}
      text2={SKIP}
      action2={ACTION_SKIP}
      makeLineAltText={(template) =>
        `${template.text}\n\nYou can tell me to "Pause" or "Start"`
      }
    >
      {children}
    </TwoButtonPanel>
  );
};

export default TimingPanel;
