import Machinat from '@machinat/core';
import { makeContainer } from '@machinat/core/service';
import { build } from '@machinat/script';
import {
  IF,
  THEN,
  VARS,
  WHILE,
  PROMPT,
  CALL,
  EFFECT,
} from '@machinat/script/keywords';
import type { ScriptCircs } from '@machinat/script/types';
import SettingsPanel from '../components/SettingsPanel';
import useEventIntent from '../utils/useEventIntent';
import Timer from '../utils/Timer';
import { ACTION_GO, ACTION_SET_UP } from '../constant';
import type {
  PomodoroSettings,
  AppActionType,
  AppEventContext,
  AppChannel,
} from '../types';
import Starting, { StartingVars, StartingReturn } from './Starting';
import Timing, { TimingVars, TimingReturn } from './Timing';
import SetUp, { SetUpReturn } from './SetUp';

type PomodoroVars = {
  settings: PomodoroSettings;
  count: number;
  action: null | AppActionType;
  remainingTime: undefined | number;
  isResting: boolean;
};

type PomodoroCircs = ScriptCircs<PomodoroVars>;

const defaultSettings = {
  pomodoroTime: 25,
  shortBreakTime: 5,
  longBreakTime: 30,
  pomodoroPerDay: 12,
};

export default build<PomodoroVars, AppEventContext, void, void>(
  'Pomodoro',
  <>
    <IF condition={({ vars }: PomodoroCircs) => !vars.settings}>
      <THEN>
        {() => (
          <>
            Please confirm the settings for the first time.
            <SettingsPanel settings={defaultSettings} />
          </>
        )}

        <PROMPT
          key="initial-settings"
          set={makeContainer({ deps: [useEventIntent] })(
            (getIntent) => async (
              { vars }: PomodoroCircs,
              { event }: AppEventContext
            ) => {
              const intent = await getIntent(event);
              return {
                ...vars,
                action: (intent.type === ACTION_SET_UP
                  ? ACTION_SET_UP
                  : ACTION_GO) as AppActionType,
              };
            }
          )}
        />

        <IF
          condition={({ vars }: PomodoroCircs) => vars.action === ACTION_SET_UP}
        >
          <THEN>
            <CALL
              script={SetUp}
              withVars={({ vars: { settings } }: PomodoroCircs) => ({
                settings,
              })}
              set={(
                { vars }: PomodoroCircs,
                { settings }: SetUpReturn
              ): PomodoroVars => ({ ...vars, settings })}
              key="setting-up"
            />
          </THEN>
        </IF>

        {() => <p>Ok, let's begin!</p>}
      </THEN>
    </IF>

    {/* app event loop */}
    <WHILE condition={() => true}>
      <VARS
        set={({ vars }: PomodoroCircs) => ({
          ...vars,
          count: (vars.count || 0) + 1,
        })}
      />

      <CALL
        script={Starting}
        withVars={({ vars }: PomodoroCircs): StartingVars => ({
          settings: vars.settings,
          count: vars.count as number,
          isResting: false,
        })}
        set={(
          { vars }: PomodoroCircs,
          { settings }: StartingReturn
        ): PomodoroVars => ({ ...vars, settings })}
        key="wait-starting"
      />

      <EFFECT
        do={makeContainer({
          deps: [Timer],
        })((timer) => ({ vars, channel }) => () =>
          timer.registerTimer(channel as AppChannel, vars.settings.pomodoroTime)
        )}
      />

      <CALL
        script={Timing}
        withVars={({ vars }: PomodoroCircs): TimingVars => ({
          beginAt: new Date(),
          settings: vars.settings,
          count: vars.count as number,
        })}
        set={(
          { vars }: PomodoroCircs,
          { settings, remainingTime }: TimingReturn
        ): PomodoroVars => ({
          ...vars,
          settings,
          isResting: remainingTime ? vars.isResting : !vars.isResting,
          remainingTime,
        })}
        key="wait-timing"
      />
    </WHILE>
  </>
);
