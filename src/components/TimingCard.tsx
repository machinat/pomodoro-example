import Sociably from '@sociably/core';
import ordinal from 'ordinal';
import formatTime from '../utils/formatTime';
import { ACTION_PAUSE, ACTION_SKIP, TimingPhase } from '../constant';
import ActionsCard from './ActionsCard';

type TimingCardProps = {
  timingPhase: TimingPhase;
  pomodoroNum: number;
  remainingTime: number;
};

const TimingCard = ({
  timingPhase,
  pomodoroNum,
  remainingTime,
}: TimingCardProps) => {
  return (
    <ActionsCard
      actions={[
        { text: 'Skip ⏹', type: ACTION_SKIP },
        { text: 'Pause ⏸️', type: ACTION_PAUSE },
      ]}
      makeLineAltText={(template) =>
        `${template.text}\n\nYou can tell me to "Pause" or "Start"`
      }
    >
      {timingPhase === TimingPhase.Working
        ? `${ordinal(pomodoroNum)} 🍅`
        : 'Break time ☕'}
      , {formatTime(remainingTime)} remain
    </ActionsCard>
  );
};

export default TimingCard;
