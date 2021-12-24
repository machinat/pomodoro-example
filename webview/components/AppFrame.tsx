import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { MachinatNode, MachinatProfile } from '@machinat/core';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';

type AppFrameProp = {
  children: ReactNode;
  userProfile?: null | MachinatProfile;
};

const AppFrame = ({ children, userProfile }: AppFrameProp) => {
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const handleMenuClose = () => setMenuOpen(false);

  const router = useRouter();

  return (
    <>
      <style global jsx>{`
        body {
          margin: 0;
          background-color: #eee;
        }
      `}</style>

      <Drawer open={isMenuOpen} onClose={handleMenuClose}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={handleMenuClose}
          onKeyDown={handleMenuClose}
        >
          <Toolbar>
            <Typography variant="h6" component="div">
              Pomodoro Example
            </Typography>
          </Toolbar>
          <Divider />
          <List>
            <ListItem
              button
              key="Statistics"
              onClick={() => router.push('/statistics')}
              selected={router.pathname === '/statistics'}
            >
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Statistics" />
            </ListItem>
            <ListItem
              button
              key="Settings"
              onClick={() => router.push('/settings')}
              selected={router.pathname === '/settings'}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <AppBar color="default" position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {router.pathname === '/statistics'
              ? 'Pomodoro Statistics'
              : router.pathname === '/settings'
              ? 'Pomodoro Settings'
              : 'Pomodoro'}
          </Typography>
          {userProfile ? (
            <Avatar alt={userProfile.name} src={userProfile.avatarUrl} />
          ) : (
            <Avatar>
              <PersonIcon />
            </Avatar>
          )}
        </Toolbar>
      </AppBar>

      {children}
    </>
  );
};

export default AppFrame;
