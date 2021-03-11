import { makeFactoryProvider } from '@machinat/core/service';
import DialogFlow from '@machinat/dialogflow';
import { MessengerEvent } from '@machinat/messenger/types';
import { TelegramEvent } from '@machinat/telegram/types';
import { LineEvent } from '@machinat/line/types';
import decodePostbackData from '../utils/decodePostbackData';
import {
  ACTION_TIME_UP,
  INTENT_OK,
  INTENT_NO,
  INTENT_UNKNOWN,
} from '../constant';
import { AppActionType, TimeUpEvent } from '../types';

type EventIntent = {
  type:
    | AppActionType
    | typeof INTENT_OK
    | typeof INTENT_NO
    | typeof INTENT_UNKNOWN;
  confidence: number;
  payload: any;
};

const useEventIntent = (recognizer: DialogFlow.IntentRecognizer) => async (
  event: MessengerEvent | TelegramEvent | LineEvent | TimeUpEvent
): Promise<EventIntent> => {
  if (event.type === 'time_up') {
    return {
      type: ACTION_TIME_UP,
      confidence: 1,
      payload: null,
    };
  }

  if (event.type === 'text') {
    const { type, confidence, payload } = await recognizer.detectText(
      event.channel,
      event.text
    );
    return {
      type: (type as AppActionType) || INTENT_UNKNOWN,
      confidence,
      payload,
    };
  }

  if (
    (event.platform === 'messenger' &&
      (event.type === 'quick_reply' || event.type === 'postback')) ||
    (event.platform === 'telegram' && event.type === 'callback_query') ||
    (event.platform === 'line' && event.type === 'postback')
  ) {
    if (event.data) {
      const { action, ...payload } = decodePostbackData(event.data);
      return {
        type: action as AppActionType,
        confidence: 1,
        payload,
      };
    }
  }

  return {
    type: INTENT_UNKNOWN,
    confidence: 0,
    payload: null,
  };
};

export default makeFactoryProvider({
  lifetime: 'scoped',
  deps: [DialogFlow.IntentRecognizer],
})(useEventIntent);
