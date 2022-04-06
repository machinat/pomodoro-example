import Machinat, { makeContainer } from '@machinat/core';
import useAppData from '../services/useAppData';
import { STATISTICS_PAGE } from '../constant';
import type { AppChannel } from '../types';
import ButtonsCard from './ButtonsCard';

type StatisticsCardProps = {
  channel: AppChannel;
  noTitle?: boolean;
};

export default makeContainer({ deps: [useAppData] })(function StatisticsCard(
  getAppData
) {
  return async ({ channel, noTitle = false }: StatisticsCardProps) => {
    const { settings, statistics } = await getAppData(channel);
    const { records, recentCounts } = statistics;

    const recentSum = recentCounts.reduce((sum, [, count]) => sum + count, 0);
    const recentDays = recentCounts.length;

    const recentAvg =
      recentDays > 0 ? (recentSum / recentDays).toFixed(1) : '-';
    const finishRate =
      recentDays > 0
        ? ((recentSum * 100) / (recentDays * settings.pomodoroPerDay)).toFixed()
        : '-';

    const settingsDesc = `${
      noTitle
        ? ''
        : `📜 Records:
`
    }‣ Today's 🍅: ${records.length}
‣ Avg. 🍅:      ${recentAvg}
‣ Finish Rate: ${finishRate}%`;

    return (
      <ButtonsCard
        makeLineAltText={(template) => `${template.text}`}
        buttons={[{ type: 'webview', text: 'More 📊', page: STATISTICS_PAGE }]}
      >
        {settingsDesc}
      </ButtonsCard>
    );
  };
});
