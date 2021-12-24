import React from 'react';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import AppFrame from '../components/AppFrame';
import NummericSetting from '../components/NummericSetting';
import { PomodoroSettings, PanelPageProps } from '../types';

const SettingsPanel = ({
  appData,
  sendAction,
  closeWebview,
}: PanelPageProps) => {
  const settings = appData?.settings || null;

  const [settingsInput, setSettingsInput] = React.useState<
    Partial<PomodoroSettings>
  >({});
  const [shouldUpdate, setShouldUpdate] = React.useState(false);
  const [isUpdating, setUpdating] = React.useState(false);

  React.useEffect(() => {
    if (isUpdating) {
      setUpdating(false);
      setShouldUpdate(false);
      closeWebview();
    }
  }, [settings]);

  const handleSettingChange =
    (fieldName: keyof PomodoroSettings) => (value: number) => {
      setSettingsInput({ ...settingsInput, [fieldName]: value });
      if (settings && value !== settings[fieldName]) {
        setShouldUpdate(true);
      }
    };

  const displayedSettings = settings ? { ...settings, ...settingsInput } : null;

  return (
    <AppFrame userProfile={appData?.userProfile}>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={!settings || isUpdating}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Container style={{ padding: '30px' }} maxWidth="sm">
        <Stack spacing={2}>
          <NummericSetting
            fieldId="pomodoro-time"
            fieldName="Pomodoro Time"
            value={displayedSettings?.workingMins || 1}
            disabled={!settings || isUpdating}
            onChange={handleSettingChange('workingMins')}
            min={1}
            max={60}
            unit="min"
          />
          <NummericSetting
            fieldId="short-break-time"
            fieldName="Short Break Time"
            value={displayedSettings?.shortBreakMins || 1}
            disabled={!settings || isUpdating}
            onChange={handleSettingChange('shortBreakMins')}
            min={1}
            max={20}
            unit="min"
          />
          <NummericSetting
            fieldId="long-break-time"
            fieldName="Long Break Time"
            value={displayedSettings?.longBreakMins || 1}
            disabled={!settings || isUpdating}
            onChange={handleSettingChange('longBreakMins')}
            min={1}
            max={60}
            unit="min"
          />
          <NummericSetting
            fieldId="pomodoro-per-day"
            fieldName="Pomodoro Per Day"
            value={displayedSettings?.pomodoroPerDay || 1}
            disabled={!settings || isUpdating}
            onChange={handleSettingChange('pomodoroPerDay')}
            min={1}
            max={30}
            unit=" 🍅 "
          />
          <NummericSetting
            fieldId="timezone"
            fieldName="Timezone"
            value={displayedSettings?.timezone || 0}
            disabled={!settings || isUpdating}
            onChange={handleSettingChange('timezone')}
            min={-12}
            max={12}
            unit="UTC"
          />

          <Stack
            style={{ marginTop: '40px' }}
            direction="row"
            justifyContent="space-around"
            spacing={2}
          >
            <Button
              variant="outlined"
              color="error"
              size="large"
              disabled={!shouldUpdate || isUpdating}
              onClick={() => {
                setSettingsInput({});
                setShouldUpdate(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="large"
              disabled={!shouldUpdate || isUpdating}
              onClick={() => {
                setUpdating(true);
                sendAction({
                  category: 'app',
                  type: 'update_settings',
                  payload: { settings: settingsInput },
                });
              }}
            >
              Update
            </Button>
          </Stack>
        </Stack>
      </Container>
    </AppFrame>
  );
};

export default SettingsPanel;
