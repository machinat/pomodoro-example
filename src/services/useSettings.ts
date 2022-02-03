import { makeFactoryProvider } from '@machinat/core';
import { PomodoroSettings, AppChannel } from '../types';
import useAppData from './useAppData';

export default makeFactoryProvider({
  lifetime: 'scoped',
  deps: [useAppData],
})(function useSettings(updateAppData) {
  return async (
    channel: AppChannel,
    updates: null | Partial<PomodoroSettings>
  ): Promise<PomodoroSettings> => {
    const { settings } = await updateAppData(channel, (data) => {
      if (!updates) {
        return data;
      }

      return {
        ...data,
        settings: { ...data.settings, ...updates },
      };
    });

    return settings;
  };
});
