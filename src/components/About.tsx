import Machinat from '@machinat/core';
import WhatToDoExpression from './WhatToDoExpression';

const About = () => (
  <WhatToDoExpression>
    I'm a timing bot 🤖 for Pomodoro Technique 🍅
    {'\n'}
    https://en.wikipedia.org/wiki/Pomodoro_Technique
    <br />
    This App is an example of Machinat Chat Framework.
    {'\n'}
    Check the source code here:
    {'\n'}
    https://github.com/machinat/pomodoro-example
  </WhatToDoExpression>
);

export default About;
