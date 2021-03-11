import { makeClassProvider } from '@machinat/core/service';
import StateController from '@machinat/core/base/StateController';
import BaseBot from '@machinat/core/base/Bot';
import Script from '@machinat/script';
import type { MessengerChat } from '@machinat/messenger/types';
import type { TelegramChat } from '@machinat/telegram/types';
import type { LineChat } from '@machinat/line/types';

type TimerData = {
  channel: MessengerChat | TelegramChat | LineChat;
  minutes: number;
};

const CHAT_TIME_UP_KEY = 'chat_time_up';

type TimeUpListener = (timeUpTargets: TimerData[]) => void;

export class Timer {
  stateController: StateController;
  private _intervalId: null | NodeJS.Timeout;
  private _listeners: TimeUpListener[];

  constructor(stateController: StateController) {
    this.stateController = stateController;
    this._listeners = [];
  }

  start(): void {
    this._intervalId = setInterval(this._handleTimesUp.bind(this), 30000);
  }

  stop(): void {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  async registerTimer(
    channel: MessengerChat | TelegramChat | LineChat,
    minutes: number
  ): Promise<void> {
    const minuteKey = new Date(Date.now() + minutes * 60000)
      .toISOString()
      .slice(0, -8);

    await this.stateController
      .channelState(channel)
      .set(CHAT_TIME_UP_KEY, minuteKey);
    await this.stateController
      .globalState(minuteKey)
      .set<TimerData>(channel.uid, { channel, minutes });
  }

  async cancelTimer(
    channel: MessengerChat | TelegramChat | LineChat
  ): Promise<boolean> {
    const minuteKey = await this.stateController
      .channelState(channel)
      .get<string>(CHAT_TIME_UP_KEY);

    if (!minuteKey) {
      return false;
    }

    const isDeleted = await this.stateController
      .globalState(minuteKey)
      .delete(channel.uid);
    return isDeleted;
  }

  onTimesUp(listener: TimeUpListener): void {
    this._listeners.push(listener);
  }

  private async _handleTimesUp() {
    const minuteKey = new Date().toISOString().slice(0, -8);
    const minuteState = this.stateController.globalState(minuteKey);

    const timingChats = await minuteState.getAll<TimerData>();
    if (timingChats.size === 0) {
      return;
    }

    const targets = [...timingChats.values()];
    for (const listener of this._listeners) {
      listener(targets);
    }
  }
}

export default makeClassProvider({
  lifetime: 'singleton',
  deps: [StateController, Script.Processor, BaseBot],
})(Timer);
