import Machinat from '@machinat/core';
import { makeContainer } from '@machinat/core/service';
import { build } from '@machinat/script';
import {
  $,
  IF,
  THEN,
  WHILE,
  PROMPT,
  CALL,
  EFFECT,
} from '@machinat/script/keywords';
import SettingsPanel from '../components/SettingsPanel';
import useEventIntent from '../utils/useEventIntent';
import Timer from '../utils/Timer';
import { ACTION_OK, ACTION_SET_UP, TimingStatus } from '../constant';
import type {
  PomodoroSettings,
  AppActionType,
  AppEventContext,
  AppChannel,
} from '../types';
import Starting from './Starting';
import Timing from './Timing';
import SetUp from './SetUp';

type PomodoroVars = {
  settings: PomodoroSettings;
  pomodoroNum: number;
  remainingTime: undefined | number;
  timingStatus: TimingStatus;
  action: AppActionType;
};

export default build<void, PomodoroVars, AppEventContext, void, void>(
  {
    name: 'Pomodoro',
    initVars: () => ({
      settings: {
        workingMins: 25,
        shortBreakMins: 5,
        longBreakMins: 30,
        pomodoroPerDay: 12,
      },
      pomodoroNum: 1,
      action: ACTION_OK,
      remainingTime: undefined,
      timingStatus: TimingStatus.Working,
    }),
  },
  <$<PomodoroVars>>
    {({ vars }) => (
      <>
        Please confirm the settings for the first time.
        <SettingsPanel settings={vars.settings} />
      </>
    )}

    <PROMPT<PomodoroVars, AppEventContext>
      key="initial-settings"
      set={makeContainer({ deps: [useEventIntent] })(
        (getIntent) => async ({ vars }, { event }) => {
          const intent = await getIntent(event);
          return {
            ...vars,
            action: intent.type === ACTION_SET_UP ? ACTION_SET_UP : ACTION_OK,
          };
        }
      )}
    />

    <IF<PomodoroVars> condition={({ vars }) => vars.action === ACTION_SET_UP}>
      <THEN>
        <CALL<PomodoroVars, typeof SetUp>
          script={SetUp}
          params={({ vars: { settings } }) => ({ settings })}
          set={({ vars }, { settings }) => ({ ...vars, settings })}
          key="initial-setup"
        />
      </THEN>
    </IF>

    {() => <p>Ok, let's begin!</p>}

    {/* app event loop */}
    <WHILE<PomodoroVars> condition={() => true}>
      <CALL<PomodoroVars, typeof Starting>
        script={Starting}
        params={({ vars }) => ({ ...vars })}
        set={({ vars }, { settings }) => ({ ...vars, settings })}
        key="wait-starting"
      />

      <EFFECT<PomodoroVars>
        do={makeContainer({
          deps: [Timer],
        })((timer) => ({ vars, channel }) => () =>
          timer.registerTimer(channel as AppChannel, vars.settings.workingMins)
        )}
      />

      <CALL<PomodoroVars, typeof Timing>
        script={Timing}
        params={({ vars }) => ({
          ...vars,
          time: vars.remainingTime || vars.settings.workingMins * 60000,
        })}
        set={({ vars }, { settings, remainingTime }) => {
          const { pomodoroNum, timingStatus } = vars;
          const isFininshed = !remainingTime;

          const nextPomodoroNum =
            isFininshed && timingStatus === TimingStatus.Working
              ? pomodoroNum + 1
              : pomodoroNum;

          return {
            ...vars,
            settings,
            remainingTime,
            pomodoroNum: nextPomodoroNum,
            timingStatus: !isFininshed
              ? timingStatus
              : timingStatus === TimingStatus.Working
              ? pomodoroNum % 4 === 0
                ? TimingStatus.LongBreak
                : TimingStatus.ShortBreak
              : TimingStatus.Working,
          };
        }}
        key="wait-timing"
      />

      <IF<PomodoroVars> condition={({ vars }) => !!vars.remainingTime}>
        <THEN>
          <EFFECT<PomodoroVars>
            do={makeContainer({
              deps: [Timer],
            })((timer) => ({ channel }) => () =>
              timer.cancelTimer(channel as AppChannel)
            )}
          />
        </THEN>
      </IF>
    </WHILE>
  </$>
);
