import Machinat from '@machinat/core';
import ordinal from 'ordinal';
import formatTime from '../utils/formatTime';
import { ACTION_START, TimingStatus } from '../constant';
import { PomodoroSettings } from '../types';
import ActionsCard from './ActionsCard';

type StartingCardProps = {
  remainingTime: undefined | number;
  pomodoroNum: number;
  timingStatus: TimingStatus;
  settings: PomodoroSettings;
};

const StartingCard = ({
  remainingTime,
  pomodoroNum,
  timingStatus,
  settings,
}: StartingCardProps) => {
  const msg = remainingTime
    ? `Continue ${
        timingStatus === TimingStatus.Working
          ? `${ordinal(pomodoroNum)} 🍅`
          : 'break time ☕'
      }, ${formatTime(remainingTime)} remaining`
    : timingStatus !== TimingStatus.Working
    ? `Take a ${
        timingStatus === TimingStatus.LongBreak
          ? settings.longBreakMins
          : settings.shortBreakMins
      } min break ☕`
    : pomodoroNum <= settings.pomodoroPerDay
    ? `Start your ${
        pomodoroNum === settings.pomodoroPerDay ? 'last' : ordinal(pomodoroNum)
      } 🍅 today.`
    : `You have already finish your ${
        settings.pomodoroPerDay
      } 🍅 target today. Keep on ${ordinal(pomodoroNum)} 🍅?`;

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
