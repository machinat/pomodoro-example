import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import { EFFECT, WHILE, PROMPT, RETURN } from '@machinat/script/keywords';
import ReplyBasicActions from '../components/ReplyBasicActions';
import StartingCard from '../components/StartingCard';
import currentDayId from '../utils/currentDayId';
import {
  ACTION_START,
  ACTION_PAUSE,
  ACTION_OK,
  ACTION_NO,
  TimingStatus,
} from '../constant';
import type {
  PomodoroSettings,
  PomodoroEventContext,
  AppEventIntent,
} from '../types';

type StartingParams = {
  settings: PomodoroSettings;
  timingStatus: TimingStatus;
  remainingTime?: number;
  pomodoroNum: number;
  dayId: string;
};

type StartingVars = StartingParams & {
  intent: AppEventIntent;
  isDayChanged: boolean;
};

type StartingReturn = {
  settings: PomodoroSettings;
  isDayChanged: boolean;
};

const CHECK_DAY_CHANGE = () => (
  <EFFECT<StartingVars>
    set={({ vars }) => {
      const dayId = currentDayId(vars.settings.timezone);
      const isDayChanged = dayId !== vars.dayId;
      if (!isDayChanged) {
        return vars;
      }
      return {
        ...vars,
        dayId,
        isDayChanged: true,
        pomodoroNum: 1,
        timingStatus: TimingStatus.Working,
        remainingTime: undefined,
      };
    }}
  />
);

export default build<
  StartingVars,
  PomodoroEventContext,
  StartingParams,
  StartingReturn
>(
  {
    name: 'Starting',
    initVars: (params) => ({
      ...params,
      intent: { type: ACTION_OK, confidence: 1, payload: null },
      isDayChanged: false,
    }),
  },
  <>
    <WHILE<StartingVars>
      condition={({ vars: { intent } }) => intent.type !== ACTION_START}
    >
      {CHECK_DAY_CHANGE()}
      {({
        vars: { intent, settings, pomodoroNum, timingStatus, remainingTime },
      }) => {
        if (intent.type === ACTION_PAUSE) {
          return <p>It's not timing now 😉</p>;
        }
        if (intent.type === ACTION_NO) {
          return <p>OK, tell me when yor're ready</p>;
        }
        return (
          <ReplyBasicActions
            intent={intent}
            settings={settings}
            defaultReply={
              <StartingCard
                settings={settings}
                pomodoroNum={pomodoroNum}
                timingStatus={timingStatus}
                remainingTime={remainingTime}
              />
            }
          />
        );
      }}

      <PROMPT<StartingVars, PomodoroEventContext>
        key="wait-start"
        set={async ({ vars }, { event, intent }) => {
          return {
            ...vars,
            settings:
              event.type === 'settings_updated'
                ? event.payload.settings
                : vars.settings,
            intent:
              vars.intent.type === ACTION_OK && intent.type === ACTION_OK
                ? {
                    type: ACTION_START,
                    confidence: 1,
                    payload: intent.payload,
                  }
                : intent,
          };
        }}
      />

      {CHECK_DAY_CHANGE()}
    </WHILE>

    <RETURN<StartingVars, StartingReturn>
      value={({ vars: { settings, isDayChanged } }) => ({
        settings,
        isDayChanged,
      })}
    />
  </>
);
