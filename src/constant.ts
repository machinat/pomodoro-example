export const STATE_KEY_APP_DATA = 'app_data';
export const STATE_KEY_PROFILE = 'profile';

export const ACTION_MESSENGER_GETTING_START = 'messenger_getting_start';
export const ACTION_START = 'start'; // Start timing
export const ACTION_PAUSE = 'pause'; // Pause timing
export const ACTION_SKIP = 'skip'; // Skip this timing phase
export const ACTION_TIME_UP = 'time_up'; // Timing up
export const ACTION_CHECK_SETTINGS = 'settings'; // Show settings
export const ACTION_CHECK_STATISTICS = 'statistics'; // Show statistics
export const ACTION_SETTINGS_UPDATED = 'settings_updated'; // Show settings
export const ACTION_ABOUT = 'about'; // About this app
export const ACTION_OK = 'ok';
export const ACTION_NO = 'no';
export const ACTION_UNKNOWN = 'unknown';

export enum TimingPhase {
  Working,
  ShortBreak,
  LongBreak,
}

export const STATISTICS_PAGE = 'statistics';
export const SETTINGS_PAGE = 'settings';
