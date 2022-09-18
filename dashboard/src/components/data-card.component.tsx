import React, { useState, useEffect } from 'react'
import { Box, makeStyles, Typography } from '@material-ui/core'
import ChartComponent from './chart.component'

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    // backgroundColor: '#d6cfcb',
    backgroundColor: "#F8F0E3",
    padding: spacing(4, 6, 6, 6),
    borderRadius: '4px',
  },
  rootTaller: {
    // backgroundColor: '#d6cfcb',
    backgroundColor: "#F8F0E3",
    padding: spacing(10, 6, 10, 6),
    borderRadius: '4px',
    height: '4.8em',
  },
  title: {
    margin: 0,
    color: "#565264",
  },
  value: {
    marginTop: "0.3em",
    color: "#a6808c",
  },
  warning: {
    backgroundColor: '#FAA0A0',
    padding: spacing(4, 6, 6, 6),
    borderRadius: '4px',
  }
}))

interface Props {
    title: string,
    value?: string,
    taller?: boolean,
    // isChart?: boolean,
    // warning?: boolean
    children?: React.ReactNode,
}

const DataCardComponent: React.FC<Props> = (props: React.PropsWithChildren<Props>) => {
  const classes = useStyles()
  const {children, title, value, taller} = props

  return (
    <Box display='flex' justifyContent='center' alignItems='center' className={taller ? classes.rootTaller : classes.root}>
     <Typography align='center' variant='h4' className={classes.title}>{title}</Typography>
      {value && <Typography align='center' variant='h6' className={classes.value}>{value}</Typography>}
      {children}
    </Box>
  )
}

export default DataCardComponent
