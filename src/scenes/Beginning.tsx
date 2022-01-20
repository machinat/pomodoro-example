import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import * as $ from '@machinat/script/keywords';
import SettingsCard from '../components/SettingsCard';
import Pause from '../components/Pause';
import { ACTION_UNKNOWN, ACTION_SETTINGS_UPDATED } from '../constant';
import type {
  PomodoroSettings,
  PomodoroEventContext,
  PomodoroScriptYield,
  AppActionType,
} from '../types';
import AskingTimezone from './AskingTimezone';

type BeginningParams = {
  settings: PomodoroSettings;
};

type BeginningVars = BeginningParams & {
  action: AppActionType;
  shouldSaveTz: boolean;
};

type BeginningReturn = BeginningParams;

export default build<
  BeginningVars,
  PomodoroEventContext,
  BeginningParams,
  BeginningReturn
>(
  {
    name: 'Beginning',
    initVars: ({ settings }) => ({
      settings,
      action: ACTION_UNKNOWN,
      shouldSaveTz: false,
    }),
  },
  <$.BLOCK<BeginningVars>>
    {() => (
      <>
        <p>Hello! 🍅</p>
        <p>I'm a Pomodoro Timer Bot 🤖</p>
        <Pause />
      </>
    )}

    <$.IF
      condition={({ platform }) =>
        platform === 'telegram' || platform === 'line'
      }
    >
      <$.THEN>
        {() => (
          <>
            I need to know your timezone to count 🍅
            <Pause />
          </>
        )}
        <$.CALL<BeginningVars, typeof AskingTimezone>
          script={AskingTimezone}
          key="ask-timezone"
          params={({ vars: { settings } }) => ({ timezone: settings.timezone })}
          set={({ vars }, { timezone }) => {
            const { settings } = vars;
            return {
              ...vars,
              settings: {
                ...settings,
                timezone: timezone || settings.timezone,
              },
              shouldSaveTz: timezone !== settings.timezone,
            };
          }}
        />

        <$.EFFECT<BeginningVars, PomodoroScriptYield>
          yield={({ vars }, prev) => ({
            ...prev,
            updateSettings: vars.shouldSaveTz
              ? {
                  ...prev?.updateSettings,
                  timezone: vars.settings.timezone,
                }
              : undefined,
          })}
        />
      </$.THEN>
    </$.IF>

    {({ vars }) => (
      <>
        <p>Please confirm your settings ⚙️</p>
        <Pause />
        <SettingsCard
          settings={vars.settings}
          noTitle
          withEditButton
          withOkButton
        />
      </>
    )}

    <$.PROMPT<BeginningVars, PomodoroEventContext>
      key="confirm-settings"
      set={async ({ vars }, { event, intent }) => ({
        ...vars,
        action: intent.type,
        settings:
          event.type === 'settings_updated'
            ? event.payload.settings
            : vars.settings,
      })}
    />

    {({ vars: { action, settings } }) => {
      const isUpdated = action === ACTION_SETTINGS_UPDATED;
      return (
        <>
          {isUpdated && (
            <>
              <p>Settings updated ⚙️</p>
              <SettingsCard settings={settings} noTitle />
              <Pause />
            </>
          )}
          <Pause />
          <p>👍 Let's begin!</p>
        </>
      );
    }}

    <$.RETURN<BeginningVars, BeginningReturn>
      value={({ vars: { settings } }) => ({ settings })}
    />
  </$.BLOCK>
);
