import Machinat from '@machinat/core';
import type { ScriptCircs } from '@machinat/script/types';
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
  answerSlot?: number;
};

type SetUpCircs = ScriptCircs<SetUpVars>;

export type SetUpReturn = {
  settings: PomodoroSettings;
};

const ASKING = (field: string, words: string) => (
  <>
    {() => words}

    <WHILE
      condition={({ vars: { answerSlot } }: SetUpCircs) =>
        !answerSlot || Number.isNaN(answerSlot)
      }
    >
      <IF condition={({ vars }: SetUpCircs) => vars.answerSlot === undefined}>
        <THEN>{() => 'Please give me a number'}</THEN>
      </IF>

      <PROMPT
        key={`ask-${field}`}
        set={({ vars }, { event }) => ({
          ...vars,
          answerSlot: Number(event.text),
        })}
      />
    </WHILE>

    <VARS
      set={({ vars }: SetUpCircs) => ({
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

export default build<SetUpVars, AppEventContext, SetUpReturn, void>(
  'SetUp',
  <>
    {ASKING('pomodoroTime', 'Enter per pomodoro time in minute:')}
    {ASKING('shortBreakTime', 'Enter short break time in minute:')}
    {ASKING(
      'longBreakTime',
      'Enter long break (every 4 pomodoro) time in minute:'
    )}
    {ASKING('pomodoroPerDay', 'Enter pomodoro number a day:')}

    <RETURN value={({ vars }: SetUpCircs) => vars.settings} />
  </>
);
