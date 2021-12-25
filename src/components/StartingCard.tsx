import Machinat from '@machinat/core';
import ordinal from 'ordinal';
import formatTime from '../utils/formatTime';
import { ACTION_START, TimingPhase } from '../constant';
import { PomodoroSettings } from '../types';
import ActionsCard from './ActionsCard';

type StartingCardProps = {
  remainingTime: undefined | number;
  pomodoroNum: number;
  timingPhase: TimingPhase;
  settings: PomodoroSettings;
};

const StartingCard = ({
  remainingTime,
  pomodoroNum,
  timingPhase,
  settings,
}: StartingCardProps) => {
  const msg = remainingTime
    ? `Continue ${
        timingPhase === TimingPhase.Working
          ? `${ordinal(pomodoroNum)} 🍅`
          : 'break time ☕'
      }, ${formatTime(remainingTime)} remain`
    : timingPhase !== TimingPhase.Working
    ? `Take a ${
        timingPhase === TimingPhase.LongBreak
          ? settings.longBreakMins
          : settings.shortBreakMins
      } min break ☕`
    : `Start ${pomodoroNum <= settings.pomodoroPerDay ? 'your' : 'further'} ${
        pomodoroNum === settings.pomodoroPerDay ? 'last' : ordinal(pomodoroNum)
      } 🍅`;

  return (
    <ActionsCard
      actions={[{ text: 'Start ▶️ ', type: ACTION_START }]}
      makeLineAltText={(template) =>
        `${template.text}\n\nTell me to "Start" when you ar ready`
      }
    >
      {msg}
    </ActionsCard>
  );
};

export default StartingCard;
