import Machinat from '@machinat/core';
import { MachinatNode } from '@machinat/core/types';
import { ACTION_PAUSE, ACTION_STOP } from '../constant';
import TwoButtonPanel from './TwoButtonPanel';

type TimingPanelProps = {
  children: MachinatNode;
};

const STOP = 'Stop ⏹';
const PAUSE = 'Pause ⏸️';

const TimingPanel = ({ children }: TimingPanelProps, { platform }) => {
  return (
    <TwoButtonPanel
      text1={PAUSE}
      action1={ACTION_PAUSE}
      text2={STOP}
      action2={ACTION_STOP}
      makeLineAltText={(template) =>
        `${template.text}\n\nYou can tell me to "Pause" or "Start"`
      }
    >
      {children}
    </TwoButtonPanel>
  );
};

export default TimingPanel;
