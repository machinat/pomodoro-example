import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import {
  IF,
  THEN,
  WHILE,
  PROMPT,
  RETURN,
  VARS,
} from '@machinat/script/keywords';
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
        !answerSlot || Number.isNaN(answerSlot)
      }
    >
      <IF<SetUpVars> condition={({ vars }) => Number.isNaN(vars.answerSlot)}>
        <THEN>{() => 'Please give me a number'}</THEN>
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
  <>
    {ASKING('workingMins', 'Enter per pomodoro time in minute:')}
    {ASKING('shortBreakMins', 'Enter short break time in minute:')}
    {ASKING(
      'longBreakMins',
      'Enter long break (every 4 pomodoro) time in minute:'
    )}
    {ASKING('pomodoroPerDay', 'Enter pomodoro number a day:')}

    <RETURN<SetUpVars, SetUpData>
      value={({ vars }) => ({ settings: vars.settings })}
    />
  </>
);
