import { makeFactoryProvider } from '@machinat/core/service';
import DialogFlow from '@machinat/dialogflow';
import { MessengerEvent } from '@machinat/messenger';
import { TelegramEvent } from '@machinat/telegram';
import { LineEvent } from '@machinat/line';
import decodePostbackData from '../utils/decodePostbackData';
import { ACTION_OK, ACTION_TIME_UP, ACTION_UNKNOWN } from '../constant';
import { AppActionType, TimeUpEvent } from '../types';

type EventIntent = {
  type: AppActionType;
  confidence: number;
  payload: any;
};

const useIntent =
  (recognizer: DialogFlow.IntentRecognizer) =>
  async (
    event: MessengerEvent | TelegramEvent | LineEvent | TimeUpEvent
  ): Promise<EventIntent> => {
    if (event.type === 'time_up') {
      return {
        type: ACTION_TIME_UP,
        confidence: 1,
        payload: null,
      };
    }

    if (
      event.platform === 'messenger' &&
      event.category === 'message' &&
      event.type === 'image' &&
      event.stickerId === 369239263222822
    ) {
      return {
        type: ACTION_OK,
        confidence: 1,
        payload: null,
      };
    }

    if (event.type === 'text') {
      if (event.text === '👍' || event.text === '👌') {
        return {
          type: ACTION_OK,
          confidence: 1,
          payload: null,
        };
      }

      const { type, confidence, payload } = await recognizer.detectText(
        event.channel,
        event.text
      );
      return {
        type: (type as AppActionType) || ACTION_UNKNOWN,
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
      type: ACTION_UNKNOWN,
      confidence: 0,
      payload: null,
    };
  };

export default makeFactoryProvider({
  lifetime: 'scoped',
  deps: [DialogFlow.IntentRecognizer],
})(useIntent);
