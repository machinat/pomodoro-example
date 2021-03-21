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
} from '@machinat/script/keywords';
import RequestLocationIfPossible from '../components/RequestLocationIfPossible';
import type { PomodoroSettings, AppEventContext } from '../types';

export type SetUpVars = {
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
          answerSlot: event.type === 'text' ? Number(event.text) : undefined,
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
    {ASKING('workingMins', 'Enter per pomodoro time in minute:')}
    {ASKING('shortBreakMins', 'Enter short break time in minute:')}
    {ASKING(
      'longBreakMins',
      'Enter long break (every 4 pomodoro) time in minute:'
    )}
    {ASKING('pomodoroPerDay', 'Enter pomodoro target in one day:')}

    {({ platform }) => {
      const askingTz = 'Enter your timezone in number:';
      const askingTzOrLocaction =
        'Enter your timezone in number or send me your location:';

      return (
        <RequestLocationIfPossible makeLineAltText={() => askingTz}>
          {platform === 'telegram' || platform === 'line'
            ? askingTzOrLocaction
            : askingTz}
        </RequestLocationIfPossible>
      );
    }}

    <WHILE<SetUpVars>
      condition={({ vars: { answerSlot } }) =>
        !answerSlot ||
        !Number.isSafeInteger(answerSlot) ||
        (answerSlot > 14 && answerSlot < -12)
      }
    >
      <IF<SetUpVars> condition={({ vars }) => vars.answerSlot !== undefined}>
        <THEN>{() => 'Please give me a valid timezone number'}</THEN>
      </IF>

      <PROMPT<SetUpVars, AppEventContext>
        key="ask-timezone"
        set={({ vars }, { event }) => ({
          ...vars,
          answerSlot:
            event.type === 'location'
              ? Math.floor(event.longitude / 15 + 0.5)
              : event.type === 'text'
              ? Number(event.text)
              : undefined,
        })}
      />
    </WHILE>

    <VARS<SetUpVars>
      set={({ vars }) => ({
        ...vars,
        settings: { ...vars.settings, timezone: vars.answerSlot as number },
        answerSlot: undefined,
      })}
    />

    <RETURN<SetUpVars, SetUpData>
      value={({ vars }) => ({ settings: vars.settings })}
    />
  </$>
);
