import { Component } from 'react'
import { Header, Space, Text, Indicator, Menu, createStyles, useMantineColorScheme } from '@mantine/core'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { FaOpencart } from 'react-icons/fa'
import { GiUbisoftSun, GiNightSky } from 'react-icons/gi'
import { TbCircleDotted } from 'react-icons/tb'
import { selectCartStatus } from 'lib/reducer/cartSlice'
import { useAppSelector } from 'lib/hooks'
import logo from 'assets/logo.svg'
import LangRefIcon from './LangIcon'
import { motion } from 'framer-motion'

const useStyles = createStyles((theme) => ({
  headerContainer: {
    position: 'fixed',
    top: 0,
    width: '100%'
  },
  navTxt: {
    cursor: 'pointer',
    color: theme.colors.gray[7],
    fontFamily: 'sans-serif',
    fontWeight: 500,
    '&:hover': {
      color: theme.colors.gray[9]
    }
  },
  logoTxt: {
    marginLeft: 5
  },
  icon: {
    color: theme.colors.gray[7],
    fontSize: 22,
    cursor: 'pointer',
    '&:hover': {
      color: theme.colors.main[6]
    }
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    // width: 1024,
    margin: '0 auto',
    height: '100%',
    padding: '0 15px'
  },
  navSide: {
    display: 'flex',
    alignItems: 'center',
    height: '100%'
  },
  logo: {
    fontFamily: 'orbitron',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  signBtn: {
    '&:hover': {
      boxShadow: `0 0 1px ${theme.colors.gray[7]}`
    }
  },
  cartInd: {
    lineHeight: 0
  },
  flex: {
    display: 'flex'
  },
  activeItem: {
    color: theme.colors.main[6],
    '&:hover': {
      color: theme.colors.main[6]
    }
  },
  menuBody: {
    width: 120
  },
  themeIcon: {
    height: 22,
    overflow: 'hidden',
    position: 'relative'
  }
}))

export default function Nav () {
  const router = useRouter()
  const { pathname } = router
  const purePage = ['signup', 'signin'].some(item => pathname.indexOf(item) > -1)
  console.log(purePage, pathname);
  if (purePage) {
    return <></>
  }

  const { classes } = useStyles()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const dark = colorScheme === 'dark'
  const cartStatus = useAppSelector(selectCartStatus)
  const variants = [
    {
      open: {
        y: 22,
        transition: {
          duration: 0.5,
          delay: 0.5
        }
      },
      closed: {
        y: 0,
        transition: {
          duration: 0.5,
          delay: 0.8
        }
      }
    },
    {
      open: {
        y: -22,
        transition: {
          duration: 0.5,
          delay: 0.8
        }
      },
      closed: {
        y: 0,
        transition: {
          duration: 0.5,
          delay: 0.5
        }
      }
    }
  ]

  const list = ['Stock', 'Live', 'Chat', 'TechStack']

  class NavItems extends Component {
    render() {
      return list.map(item => {
        const path = `/${item.toLowerCase()}`
        return <div className={classes.flex} key={item}>
          <Link href={path}>
            <Text className={`${classes.navTxt} ${pathname === path ? classes.activeItem : ''}`} component="a">{item}</Text>
          </Link>
          <Space w="md" />
        </div>
      })
    }
  }

  return <Header className={classes.headerContainer} height={80} p="xs">
    <div className={classes.header}>
      <div className={classes.navSide}>
        <Link href="/">
          <Text className={classes.logo}>
            <Image width={20} height={20} src={logo} alt="logo" />
            <span className={classes.logoTxt}>funny2boring</span>
          </Text>
        </Link>
        <Space w="md" />
        <NavItems />

      </div>
      <div className={classes.navSide}>
        {['/stock', '/cart'].includes(pathname) ? <Link href="/cart">
          <Indicator className={classes.cartInd} disabled={!cartStatus} inline size={10} offset={0} position="middle-center" color="pink" withBorder>
            <FaOpencart className={`${classes.icon} ${pathname === '/cart' ? classes.activeItem : ''}`} />
          </Indicator>
        </Link> : null}
        <Space w="xs" />
        {/*<Menu  classNames={{*/}
        {/*  dropdown: classes.menuBody*/}
        {/*  // itemBody: 'your-itemBody-class'*/}
        {/*}} position="bottom-end">*/}
        {/*  <Menu.Target>*/}
        {/*    <LangRefIcon className={classes.icon} />*/}
        {/*  </Menu.Target>*/}
        {/*  <Menu.Dropdown>*/}
        {/*    <Menu.Item>*/}
        {/*      中文*/}
        {/*    </Menu.Item>*/}

        {/*    <Menu.Item>*/}
        {/*      English*/}
        {/*    </Menu.Item>*/}
        {/*  </Menu.Dropdown>*/}
        {/*</Menu>*/}
        <Space w="xs" />
        <motion.div
          className={classes.themeIcon}
          onClick={() => { toggleColorScheme() }}
          initial={false}
          animate={dark ? 'open' : 'closed'}
        >
          {/*{dark ? <GiUbisoftSun className={classes.icon} /> : <GiNightSky className={classes.icon} />}*/}
          <motion.div className={classes.themeIcon} variants={variants[0]}><GiUbisoftSun color="#223f72" className={classes.icon} /></motion.div>
          <motion.div className={classes.themeIcon} variants={variants[1]}><GiNightSky color="#223f72" className={classes.icon} /></motion.div>
        </motion.div>

        <Space w="xs" />
        <motion.div
          className={classes.flex}
          whileHover={{
            rotate: [0, 0, 270, 270, 0]
          }}
          // animate={{
          //   rotate: [0, 0, 270, 270, 0]
          // }}
        >
          <TbCircleDotted className={`${classes.icon}`} />
        </motion.div>
      </div>
    </div>
  </Header>
}