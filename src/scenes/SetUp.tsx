import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import {
  $,
  IF,
  THEN,
  WHILE,
  PROMPT,
  RETURN,
  VARS,
  CALL,
} from '@machinat/script/keywords';
import AskingTimezone from './AskingTimezone';
import type { PomodoroSettings, AppEventContext } from '../types';

type SetUpVars = {
  settings: PomodoroSettings;
  answerSlot: undefined | number;
};

export type SetUpData = {
  settings: PomodoroSettings;
};

const ASKING = (field: keyof PomodoroSettings, words: string) => (
  <>
    {() => words}

    <WHILE<SetUpVars>
      condition={({ vars: { answerSlot } }) =>
        !answerSlot || !Number.isSafeInteger(answerSlot) || answerSlot <= 0
      }
    >
      <IF<SetUpVars> condition={({ vars }) => vars.answerSlot !== undefined}>
        <THEN>{() => 'Please give me an integer'}</THEN>
      </IF>

      <PROMPT<SetUpVars, AppEventContext>
        key={`ask-${field}`}
        set={({ vars }, { event }) => ({
          ...vars,
          answerSlot:
            event.type !== 'text'
              ? undefined
              : event.text.trim() === '-'
              ? vars.settings[field]
              : Number(event.text),
        })}
      />
    </WHILE>

    <VARS<SetUpVars>
      set={({ vars }) => ({
        ...vars,
        settings: {
          ...vars.settings,
          [field]: vars.answerSlot,
        },
        answerSlot: undefined,
      })}
    />
  </>
);

export default build<SetUpData, SetUpVars, AppEventContext, SetUpData>(
  {
    name: 'SetUp',
    initVars: (input) => ({ settings: input.settings, answerSlot: undefined }),
  },
  <$>
    {() => <p>You can send a "-" character to skip the option</p>}

    {ASKING('workingMins', 'Enter per pomodoro time in minute:')}
    {ASKING('shortBreakMins', 'Enter short break time in minute:')}
    {ASKING(
      'longBreakMins',
      'Enter long break (every 4 pomodoro) time in minute:'
    )}
    {ASKING('pomodoroPerDay', 'Enter pomodoro target in one day:')}

    <CALL<SetUpVars, typeof AskingTimezone>
      script={AskingTimezone}
      key="ask-timezone"
      params={({ vars: { settings } }) => ({ timezone: settings.timezone })}
      set={({ vars }, { timezone }) => ({
        ...vars,
        settings: { ...vars.settings, timezone },
      })}
    />

    <RETURN<SetUpVars, SetUpData>
      value={({ vars }) => ({ settings: vars.settings })}
    />
  </$>
);
