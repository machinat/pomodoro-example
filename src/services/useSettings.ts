import { makeFactoryProvider } from '@machinat/core/service';
import StateController from '@machinat/core/base/StateController';
import { STATE_KEY_SETTINGS } from '../constant';
import { PomodoroSettings, AppChannel } from '../types';

const defaultSettings = {
  workingMins: 25,
  shortBreakMins: 5,
  longBreakMins: 30,
  pomodoroPerDay: 12,
  timezone: 0,
};

const useSettings =
  (controller: StateController) =>
  async (
    channel: AppChannel,
    updates: null | Partial<PomodoroSettings>
  ): Promise<PomodoroSettings> => {
    const settings = await controller
      .channelState(channel)
      .update<PomodoroSettings>(
        STATE_KEY_SETTINGS,
        (currentSettings = defaultSettings) =>
          updates ? { ...currentSettings, ...updates } : currentSettings
      );

    return settings;
  };

export default makeFactoryProvider({
  lifetime: 'scoped',
  deps: [StateController],
})(useSettings);
