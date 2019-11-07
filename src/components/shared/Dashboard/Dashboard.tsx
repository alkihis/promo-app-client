import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import HomeIcon from '@material-ui/icons/Home';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { ListSubheader, ListItem, ListItemIcon, ListItemText, List, Container } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import { ContainerProps } from '@material-ui/core/Container';

const drawerWidth = 240;

const useStylesDrawer = makeStyles(theme => ({
  selectedItem: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.getContrastText(theme.palette.primary.light)
    }
  },
  selectedItemIcon: {
    color: theme.palette.getContrastText(theme.palette.primary.main)
  },
  unselectedItem: {},
  link: {
    textDecoration: 'inherit',
    color: theme.palette.text.primary
  }
}));

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
    textAlign: 'left',
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    height: '100vh',
    overflow: 'auto',
    width: '100%',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
}));

type DashboardProps = React.PropsWithChildren<{
  drawer?: React.ReactNode;
  title?: string;
}>;

/**
 * To define drawer items : https://github.com/mui-org/material-ui/blob/master/docs/src/pages/getting-started/templates/dashboard/listItems.js
 * Content: children
 * 
 * @param props 
 */
const Dashboard: React.FC<DashboardProps> = (props: DashboardProps) => {
  const classes = useStyles();
  const match_media = window.matchMedia('screen and (min-width: 700px)');
  const [open, setOpen] = React.useState(match_media.matches);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            {props.title ? props.title : 'Dashboard'}
          </Typography>

          <Link to="/" style={{color: 'inherit'}}>
            <IconButton color="inherit">
              <HomeIcon />
            </IconButton>
          </Link>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        
        {props.drawer}
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        
        {props.children}
      </main>
    </div>
  );
}

export default Dashboard;


export type DrawerListItem = {
  icon: React.ComponentType<SvgIconProps>;
  text: string;
  selected?: boolean;
  onClick?: Function;
  linkTo?: string;
};

export type DrawerSection = {
  title?: string;
  items: DrawerListItem[];
};

export const DashboardDrawer: React.FC<{ sections: DrawerSection[] }> = props => {
  const classes = useStylesDrawer();

  // Build a list for each section
  const sections = props.sections.map((e, index) => (
    <List key={index}>
      {e.title ? <ListSubheader inset>{e.title}</ListSubheader> : ""}

      {/* Each item hold an icon and text */}
      {e.items.map((item, index) => (
        item.linkTo ? 
        <Link key={index} to={item.linkTo!} className={classes.link}>
          <ListItem button className={item.selected ? classes.selectedItem : classes.unselectedItem}>
            <ListItemIcon>
              <item.icon className={item.selected ? classes.selectedItemIcon : ""} />
            </ListItemIcon>

            <ListItemText primary={item.text} />
          </ListItem>
        </Link> : 
        <ListItem key={index} button className={item.selected ? classes.selectedItem : classes.unselectedItem}>
          <ListItemIcon>
            <item.icon />
          </ListItemIcon>

          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>  
  ));

  // Add a divider between each item
  const new_sections: JSX.Element[] = [];

  for (let i = 0; i < sections.length - 1; i++) {
    new_sections.push(sections[i]);
    new_sections.push(<Divider key={-i - 1} />);
  }
  if (sections.length)
    new_sections.push(sections[sections.length - 1]);

  return (
    <>
      {new_sections}
    </>
  );
};

export const DashboardContainer: React.FC<ContainerProps> = props => {
  const style = props.style ? { 
    marginTop: '1.5rem', 
    marginBottom: '1rem',
    ...props.style, 
  } : {
    marginTop: '1.5rem',
    marginBottom: '1rem',
  };

  return <Container style={style} {...props} />;
};
