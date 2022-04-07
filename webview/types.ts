import type { WebAppData, UpdateSettingsAction } from '../src/types';

export type { WebviewPush } from '../src/types';

export type {
  PomodoroSettings,
  UpdateSettingsAction,
  WebAppData,
} from '../src/types';

export type SendWebActionFn = (action: UpdateSettingsAction) => void;

export type PanelPageProps = {
  appData: WebAppData | null;
  sendAction: SendWebActionFn;
  closeWebview: () => boolean;
};
