import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import * as $ from '@machinat/script/keywords';
import ReplyBasicActions from '../components/ReplyBasicActions';
import StartingCard from '../components/StartingCard';
import currentDayId from '../utils/currentDayId';
import {
  ACTION_START,
  ACTION_PAUSE,
  ACTION_OK,
  ACTION_NO,
  TimingPhase,
} from '../constant';
import type {
  PomodoroSettings,
  PomodoroEventContext,
  AppActionType,
  AppChannel,
} from '../types';

type StartingParams = {
  settings: PomodoroSettings;
  phase: TimingPhase;
  remainingTime?: number;
  pomodoroNum: number;
  dayId: string;
};

type StartingVars = StartingParams & {
  action: AppActionType;
  isDayChanged: boolean;
};

type StartingReturn = {
  settings: PomodoroSettings;
  isDayChanged: boolean;
};

const CHECK_DAY_CHANGE = () => (
  <$.EFFECT<StartingVars>
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
        phase: TimingPhase.Working,
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
      action: ACTION_OK,
      isDayChanged: false,
    }),
  },
  <>
    <$.WHILE<StartingVars>
      condition={({ vars: { action } }) => action !== ACTION_START}
    >
      {CHECK_DAY_CHANGE()}
      {({
        channel,
        vars: { action, settings, pomodoroNum, phase, remainingTime },
      }) => {
        if (action === ACTION_PAUSE) {
          return <p>It's not timing now 😉</p>;
        }
        if (action === ACTION_NO) {
          return <p>OK, tell me when yor're ready</p>;
        }
        return (
          <ReplyBasicActions
            channel={channel as AppChannel}
            action={action}
            settings={settings}
            defaultReply={
              <StartingCard
                settings={settings}
                pomodoroNum={pomodoroNum}
                timingPhase={phase}
                remainingTime={remainingTime}
              />
            }
          />
        );
      }}

      <$.PROMPT<StartingVars, PomodoroEventContext>
        key="wait-start"
        set={async ({ vars }, { event, intent }) => {
          return {
            ...vars,
            settings:
              event.type === 'settings_updated'
                ? event.payload.settings
                : vars.settings,
            action:
              vars.action === ACTION_OK && intent.type === ACTION_OK
                ? ACTION_START
                : intent.type,
          };
        }}
      />

      {CHECK_DAY_CHANGE()}
    </$.WHILE>

    <$.RETURN<StartingVars, StartingReturn>
      value={({ vars: { settings, isDayChanged } }) => ({
        settings,
        isDayChanged,
      })}
    />
  </>
);
