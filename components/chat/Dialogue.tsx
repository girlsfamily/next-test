import {Avatar, createStyles} from '@mantine/core'
import { formatTimeToDay } from 'utils'

const useStyles = createStyles((theme) => ({
  dialogue: {
    display: 'flex',
    overflow: 'hidden',
    padding: '8px',
    cursor: 'pointer',
    position: 'relative'
  },
  detail: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '0 8px'
  },
  name: {
    fontSize: 14
  },
  last: {
    color: theme.colors.gray[5],
    fontSize: 12
  }
}))

export default function Dialogue () {
  const { classes } = useStyles()
  return <div className={classes.dialogue}>
    <Avatar src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80" />
    <div className={classes.detail}>
      <section className={classes.name}>测试名称</section>
      <section className={classes.last}>测试内容</section>
    </div>
    <div className={classes.last}>
      {formatTimeToDay('2022-06-26 14:11:00')}
    </div>
  </div>
}