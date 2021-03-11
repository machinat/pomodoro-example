import ordinal from 'ordinal';
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
  RETURN,
} from '@machinat/script/keywords';
import type { ScriptCircs } from '@machinat/script/types';
import SettingsPanel from '../components/SettingsPanel';
import About from '../components/About';
import StartingPanel from '../components/StartingPanel';

import useEventIntent from '../utils/useEventIntent';
import {
  ACTION_GO,
  ACTION_ABOUT,
  ACTION_START,
  ACTION_SETTINGS,
  ACTION_SET_UP,
  ACTION_STOP,
  ACTION_PAUSE,
  INTENT_OK,
  INTENT_NO,
  INTENT_UNKNOWN,
} from '../constant';
import type {
  PomodoroSettings,
  AppActionType,
  AppEventContext,
} from '../types';
import SetUp, { SetUpReturn } from './SetUp';

export type StartingVars = {
  isResting: boolean;
  remainingTime?: number;
  count: number;
  settings: PomodoroSettings;
  action?: AppActionType;
};

type StartingCircs = ScriptCircs<StartingVars>;

export type StartingReturn = {
  settings: PomodoroSettings;
};

const Starting = build<StartingVars, AppEventContext, StartingReturn, void>(
  'Starting',
  <>
    <WHILE
      condition={({ vars: { action } }: StartingCircs) =>
        action !== ACTION_START
      }
    >
      <IF
        condition={({ vars }: StartingCircs) => vars.action === ACTION_SET_UP}
      >
        <THEN>
          <CALL
            script={SetUp}
            withVars={({ vars: { settings } }: StartingCircs) => ({
              settings,
            })}
            set={({ vars }: StartingCircs, { settings }: SetUpReturn) => ({
              ...vars,
              settings,
            })}
            key="setting-up"
          />

          <VARS
            set={({ vars }: StartingCircs) => ({
              ...vars,
              actions: ACTION_GO,
            })}
          />
        </THEN>
      </IF>

      {({ vars: { action, settings, count } }: StartingCircs) => {
        switch (action) {
          case ACTION_GO:
            return (
              <StartingPanel>
                Start your {ordinal(count)} Pomodoro 🍅 today.
              </StartingPanel>
            );
          case ACTION_ABOUT:
            return <About />;
          case ACTION_SETTINGS:
            return <SettingsPanel settings={settings} />;
          case ACTION_STOP:
          case ACTION_PAUSE:
            return <p>It's not timing now 😉</p>;
          default:
            return <p>Ok, tell me when yor're ready</p>;
        }
      }}

      <PROMPT
        key="wait-start"
        set={makeContainer({ deps: [useEventIntent] })(
          (getIntent) => async (
            { vars }: StartingCircs,
            { event }: AppEventContext
          ): Promise<StartingVars> => {
            const { type: intentType } = await getIntent(event);
            return {
              ...vars,
              action:
                intentType === INTENT_NO || intentType === INTENT_UNKNOWN
                  ? undefined
                  : intentType === INTENT_OK || intentType === ACTION_GO
                  ? vars.action === ACTION_GO
                    ? ACTION_START
                    : ACTION_GO
                  : intentType,
            };
          }
        )}
      />
    </WHILE>

    <RETURN value={({ vars: { settings } }: StartingCircs) => ({ settings })} />
  </>
);

export default Starting;
