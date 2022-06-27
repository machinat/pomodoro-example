import { makeFactoryProvider, StateController } from '@sociably/core';
import { STATE_KEY_APP_DATA } from '../constant';
import { AppChannel, PomodoroAppData } from '../types';
import currentDayId from '../utils/currentDayId';

const identity = (x) => x;

const useSettings =
  (controller: StateController) =>
  async (
    channel: AppChannel,
    updateFn: (data: PomodoroAppData) => PomodoroAppData = identity
  ): Promise<PomodoroAppData> => {
    const updatedSettings = await controller
      .channelState(channel)
      .update<PomodoroAppData>(
        STATE_KEY_APP_DATA,
        (
          data = {
            settings: {
              workingMins: 25,
              shortBreakMins: 5,
              longBreakMins: 30,
              pomodoroPerDay: 12,
              timezone: 0,
            },
            statistics: {
              day: '0-0-0',
              records: [],
              recentCounts: [],
            },
          }
        ) => {
          const { settings, statistics } = data;
          const { day: recordDay, records, recentCounts } = statistics;

          const currentDay = currentDayId(settings.timezone);
          const isDayChanged = currentDay !== recordDay;

          if (!isDayChanged) {
            return updateFn(data);
          }

          return updateFn({
            settings,
            statistics: {
              day: currentDay,
              records: [],
              recentCounts:
                records.length > 0
                  ? [...recentCounts.slice(-9), [recordDay, records.length]]
                  : recentCounts,
            },
          });
        }
      );

    return updatedSettings;
  };

export default makeFactoryProvider({
  lifetime: 'scoped',
  deps: [StateController],
})(useSettings);
