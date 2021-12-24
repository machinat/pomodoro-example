import React from 'react';
import AppFrame from '../components/AppFrame';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { XYPlot, VerticalBarSeries, XAxis, YAxis } from 'react-vis';

const StatisticsPanel = () => {
  const [chartWidth, setChartWidth] = React.useState(300);
  const chartPaperRef = React.useCallback((node) => {
    if (node !== null) {
      setChartWidth(node.getBoundingClientRect().width);
    }
  }, []);

  return (
    <AppFrame>
      <Container maxWidth="md" style={{ padding: '20px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div">
                  Today's 🍅
                </Typography>
                <Typography variant="h2" component="div">
                  15
                </Typography>
                <Typography color="text.secondary">3 remaining...</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div">
                  Avg. 🍅
                </Typography>
                <Typography variant="h2" component="div">
                  10
                </Typography>
                <Typography color="text.secondary">for last 10 days</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div">
                  Settings
                </Typography>
                <Typography>
                  <ul>
                    <li>Working Time: 25 min</li>
                    <li>Short Break Time: 5 min</li>
                    <li>Long Break Time: 30 min;</li>
                    <li>Pomodoro Per Day: 12 🍅</li>
                    <li>Timezone: GMT +8</li>
                  </ul>
                </Typography>
              </CardContent>
              <CardActions></CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper ref={chartPaperRef}>
              <XYPlot width={chartWidth} height={300} xType="ordinal">
                <XAxis />
                <YAxis />
                <VerticalBarSeries
                  data={[
                    { x: '10/1', y: 7 },
                    { x: '10/2', y: 9 },
                    { x: '10/3', y: 3 },
                    { x: '10/4', y: 1 },
                    { x: '10/5', y: 7 },
                    { x: '10/6', y: 7 },
                    { x: '10/7', y: 7 },
                    { x: '10/8', y: 7 },
                    { x: '10/9', y: 7 },
                  ]}
                  color="red"
                />
              </XYPlot>
            </Paper>
          </Grid>
          <Grid item sm={12} md={6}></Grid>
        </Grid>
      </Container>
    </AppFrame>
  );
};

export default StatisticsPanel;
