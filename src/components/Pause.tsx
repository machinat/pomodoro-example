import Sociably from '@sociably/core';
import { TypingOn } from '@sociably/messenger/components';

const Pause = ({ time = 1000 }, { platform }) => (
  <>
    {platform === 'messenger' ? <TypingOn /> : null}
    <Sociably.Pause time={time} />
  </>
);

export default Pause;
