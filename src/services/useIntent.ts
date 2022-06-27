import { makeFactoryProvider } from '@sociably/core';
import DialogFlow from '@sociably/dialogflow';
import { MessengerEvent } from '@sociably/messenger';
import { TelegramEvent } from '@sociably/telegram';
import { LineEvent } from '@sociably/line';
import decodePostbackData from '../utils/decodePostbackData';
import {
  ACTION_OK,
  ACTION_TIME_UP,
  ACTION_UNKNOWN,
  ACTION_SETTINGS_UPDATED,
} from '../constant';
import {
  AppActionType,
  AppTimeUpEvent,
  AppSettingsUpdatedEvent,
  AppEventIntent,
} from '../types';

const useIntent =
  (recognizer: DialogFlow.Recognizer) =>
  async (
    event:
      | MessengerEvent
      | TelegramEvent
      | LineEvent
      | AppTimeUpEvent
      | AppSettingsUpdatedEvent
  ): Promise<AppEventIntent> => {
    if (event.type === 'time_up') {
      return { type: ACTION_TIME_UP, confidence: 1, payload: null };
    }

    if (event.type === 'settings_updated') {
      return { type: ACTION_SETTINGS_UPDATED, confidence: 1, payload: null };
    }

    if (
      event.platform === 'messenger' &&
      event.category === 'message' &&
      event.type === 'image' &&
      event.stickerId === 369239263222822
    ) {
      return { type: ACTION_OK, confidence: 1, payload: null };
    }

    if (event.type === 'text') {
      if (event.text === '👍' || event.text === '👌') {
        return { type: ACTION_OK, confidence: 1, payload: null };
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

    return { type: ACTION_UNKNOWN, confidence: 0, payload: null };
  };

export default makeFactoryProvider({
  lifetime: 'scoped',
  deps: [DialogFlow.Recognizer],
})(useIntent);
