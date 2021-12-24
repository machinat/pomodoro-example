import Machinat from '@machinat/core';
import ordinal from 'ordinal';
import formatTime from '../utils/formatTime';
import { ACTION_PAUSE, ACTION_SKIP, TimingStatus } from '../constant';
import ActionsCard from './ActionsCard';

type TimingCardProps = {
  timingStatus: TimingStatus;
  pomodoroNum: number;
  remainingTime: number;
};

const TimingCard = ({
  timingStatus,
  pomodoroNum,
  remainingTime,
}: TimingCardProps) => {
  return (
    <ActionsCard
      actions={[
        { text: 'Pause ⏸️', type: ACTION_PAUSE },
        { text: 'Skip ⏹', type: ACTION_SKIP },
      ]}
      makeLineAltText={(template) =>
        `${template.text}\n\nYou can tell me to "Pause" or "Start"`
      }
    >
      {timingStatus === TimingStatus.Working
        ? `${ordinal(pomodoroNum)} 🍅`
        : 'Break time ☕'}
      , {formatTime(remainingTime)} remaining
    </ActionsCard>
  );
};

export default TimingCard;
