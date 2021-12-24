import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import { PROMPT, RETURN } from '@machinat/script/keywords';
import RequestLocationIfPossible from '../components/RequestLocationIfPossible';
import type { PomodoroEventContext } from '../types';

type AskingTimezoneReturn = {
  timezone: undefined | number;
};

type AskingTimezoneVars = {
  answer: string;
  timezone: undefined | number;
  isValid: boolean;
};

export default build<
  AskingTimezoneVars,
  PomodoroEventContext,
  {},
  AskingTimezoneReturn
>(
  {
    name: 'AskingTimezone',
    initVars: () => ({ answer: '', timezone: 0, isValid: false }),
  },
  <>
    {({ platform }) => {
      const askingTz = 'Please enter your timezone in number';
      const askingTzOrLocaction =
        'Please send me your location or enter your timezone in number';

      return (
        <RequestLocationIfPossible makeLineAltText={() => askingTz}>
          {platform === 'telegram' || platform === 'line'
            ? askingTzOrLocaction
            : askingTz}
        </RequestLocationIfPossible>
      );
    }}

    <PROMPT<AskingTimezoneVars, PomodoroEventContext>
      key="ask"
      set={(_, { event }) => {
        if (event.type === 'location') {
          const tz = Math.floor(event.longitude / 15 + 0.5);
          return {
            answer: `${tz >= 0 ? '+' : ''}${tz}`,
            timezone: tz,
            isValid: true,
          };
        }

        if (event.type === 'text') {
          const answer = event.text;
          const matchTz = answer.match(/([\+-]?)\s*([0-9]{2})/);

          if (matchTz) {
            const [, sign, num] = matchTz;
            const tz = Number(sign + num);

            if (tz <= 12 && tz >= -12) {
              return { answer, timezone: tz, isValid: true };
            }
            return { answer, timezone: undefined, isValid: false };
          }
        }

        return {
          answer: `[ ${event.type} ]`,
          timezone: undefined,
          isValid: false,
        };
      }}
    />

    {({ vars }) =>
      vars.isValid ? null : (
        <p>{vars.answer} is not a valid timezone. You can set it later when</p>
      )
    }

    <RETURN<AskingTimezoneVars, AskingTimezoneReturn>
      value={({ vars }) => ({ timezone: vars.timezone })}
    />
  </>
);
