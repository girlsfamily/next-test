import { HiOutlineBadgeCheck, HiOutlineCheckCircle } from 'react-icons/hi'
// import { AiOutlineLoading } from 'react-icons/ai'
import { TbLoader } from 'react-icons/tb'
import {createStyles} from "@mantine/core"
import { motion } from 'framer-motion'

interface nickCheckStatus {
  status: number
  onClick: () => void;
}

const useStyles = createStyles((theme) => ({
  wait: {
    cursor: 'pointer',
    color: theme.colors.gray[7]
  },
  success: {
    color: theme.colors.green[7]
  },
  pending: {
    color: theme.colors.main[7]
  },
  icon: {
    lineHeight: 0
  }
}))

export default function CheckStatusIcon({ status, ...props }: nickCheckStatus) {
  const { classes } = useStyles()

  switch (status) {
    case 0:
      return <HiOutlineBadgeCheck {...props} size="18" className={classes.wait} />
    case 1:
      return <HiOutlineCheckCircle {...props} size="18" className={classes.success} />
    default:
      return <motion.span className={classes.icon} {...props} animate={{ rotate: 360 }} transition={{ ease: 'linear', repeat: Infinity, duration: 1 }}>
        <TbLoader size="20" className={classes.pending}></TbLoader>
      </motion.span>
  }
}