import ordinal from 'ordinal';
import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import { $, IF, THEN, WHILE, PROMPT, RETURN } from '@machinat/script/keywords';
import TimingCard from '../components/TimingCard';
import StopingCard from '../components/StopingCard';
import ReplyBasicActions from '../components/ReplyBasicActions';
import {
  ACTION_SKIP,
  ACTION_PAUSE,
  ACTION_TIME_UP,
  ACTION_OK,
  TimingStatus,
} from '../constant';
import type {
  PomodoroEventContext,
  AppEventIntent,
  PomodoroSettings,
} from '../types';

type TimingParams = {
  time: number;
  pomodoroNum: number;
  settings: PomodoroSettings;
  timingStatus: TimingStatus;
};

type TimingVars = TimingParams & {
  beginAt: Date;
  pauseAt: null | Date;
  intent: AppEventIntent;
};

type TimingReturn = {
  settings: PomodoroSettings;
  remainingTime: number;
};

const PROMPT_WHEN_TIMING = (key: string) => (
  <PROMPT<TimingVars, PomodoroEventContext>
    key={key}
    set={async ({ vars }, { event, intent }) => {
      const pauseAt = intent.type === ACTION_PAUSE ? new Date() : null;
      const settings =
        event.type === 'settings_updated'
          ? event.payload.settings
          : vars.settings;
      return { ...vars, pauseAt, intent, settings };
    }}
  />
);

export default build<
  TimingVars,
  PomodoroEventContext,
  TimingParams,
  TimingReturn
>(
  {
    name: 'Timing',
    initVars: (params) => ({
      ...params,
      beginAt: new Date(),
      pauseAt: null,
      intent: { type: 'unknown', confidence: 0, payload: null },
    }),
  },
  <$<TimingVars>>
    <WHILE<TimingVars>
      condition={({ vars: { intent, time, beginAt } }) =>
        intent.type !== ACTION_TIME_UP &&
        intent.type !== ACTION_PAUSE &&
        time > Date.now() - beginAt.getTime()
      }
    >
      {({
        vars: { settings, intent, time, timingStatus, pomodoroNum, beginAt },
      }) => {
        return (
          <ReplyBasicActions
            intent={intent}
            settings={settings}
            defaultReply={
              <TimingCard
                timingStatus={timingStatus}
                pomodoroNum={pomodoroNum}
                remainingTime={time - (Date.now() - beginAt.getTime())}
              />
            }
          />
        );
      }}

      {PROMPT_WHEN_TIMING('wait-timing-up')}

      <IF<TimingVars>
        condition={({ vars }) => vars.intent.type === ACTION_SKIP}
      >
        <THEN>
          <IF<TimingVars>
            condition={({ vars }) => vars.timingStatus === TimingStatus.Working}
          >
            <THEN>
              {() => <StopingCard>Skip current 🍅?</StopingCard>}
              {PROMPT_WHEN_TIMING('ask-should-skip')}
            </THEN>
          </IF>

          <IF<TimingVars>
            condition={({ vars }) =>
              vars.timingStatus !== TimingStatus.Working ||
              vars.intent.type === ACTION_OK
            }
          >
            <THEN>
              {({ vars: { timingStatus, pomodoroNum } }) =>
                timingStatus === TimingStatus.Working ? (
                  <p>{ordinal(pomodoroNum)} 🍅 skipped</p>
                ) : (
                  <p>Break time skipped</p>
                )
              }

              <RETURN<TimingVars, TimingReturn>
                value={({ vars: { settings } }) => ({
                  settings,
                  remainingTime: 0,
                })}
              />
            </THEN>
          </IF>
        </THEN>
      </IF>
    </WHILE>

    {({ vars: { timingStatus, pomodoroNum, pauseAt } }) =>
      timingStatus === TimingStatus.Working ? (
        <p>
          {ordinal(pomodoroNum)} 🍅 {pauseAt ? 'paused' : 'finished'}
        </p>
      ) : (
        <p>Break time {pauseAt ? 'paused' : 'is up'}!</p>
      )
    }

    <RETURN<TimingVars, TimingReturn>
      value={({ vars: { beginAt, pauseAt, time, settings } }) => ({
        settings,
        remainingTime: pauseAt
          ? time - (pauseAt.getTime() - beginAt.getTime())
          : 0,
      })}
    />
  </$>
);
