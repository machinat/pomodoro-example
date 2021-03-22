import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import { $, IF, THEN, WHILE, PROMPT, RETURN } from '@machinat/script/keywords';
import RequestLocationIfPossible from '../components/RequestLocationIfPossible';
import type { AppEventContext } from '../types';

type AskingTimezoneData = {
  timezone: number;
};

type AskingTimezoneVars = {
  timezone: number;
  answerSlot?: number;
};

export default build<
  AskingTimezoneData,
  AskingTimezoneVars,
  AppEventContext,
  AskingTimezoneData
>(
  {
    name: 'AskingTimezone',
    initVars: ({ timezone }) => ({ timezone }),
  },
  <$>
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

    <WHILE<AskingTimezoneVars>
      condition={({ vars: { answerSlot } }) =>
        !answerSlot ||
        !Number.isSafeInteger(answerSlot) ||
        (answerSlot > 14 && answerSlot < -12)
      }
    >
      <IF<AskingTimezoneVars>
        condition={({ vars }) => vars.answerSlot !== undefined}
      >
        <THEN>{() => 'Please give me a valid timezone number'}</THEN>
      </IF>

      <PROMPT<AskingTimezoneVars, AppEventContext>
        key="ask"
        set={({ vars: { timezone } }, { event }) => ({
          timezone,
          answerSlot:
            event.type === 'location'
              ? Math.floor(event.longitude / 15 + 0.5)
              : event.type !== 'text'
              ? undefined
              : event.text.trim() === '-'
              ? timezone
              : Number(event.text),
        })}
      />
    </WHILE>

    <RETURN<AskingTimezoneVars, AskingTimezoneData>
      value={({ vars }) => ({ timezone: vars.answerSlot as number })}
    />
  </$>
);
