export const ACTION_MESSENGER_GETTING_START = 'messenger_getting_start';

/** Start timing */
export const ACTION_START = 'start';

/** Pause timing */
export const ACTION_PAUSE = 'pause';

/** Skip this timing phase */
export const ACTION_STOP = 'stop';

/** Timing up */
export const ACTION_TIME_UP = 'time_up';

/** Show settings */
export const ACTION_CHECK_SETTINGS = 'settings';

/** Edit settings */
export const ACTION_SET_UP = 'set_up';

/** About this app */
export const ACTION_ABOUT = 'about';

export const ACTION_OK = 'ok';

export const ACTION_NO = 'no';

export const ACTION_UNKNOWN = 'unknown';

export enum TimingStatus {
  Working,
  ShortBreak,
  LongBreak,
}
