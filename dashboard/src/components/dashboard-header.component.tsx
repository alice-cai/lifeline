import React, { useState, useEffect } from 'react'
import { Box, makeStyles, Typography } from '@material-ui/core'

const useStyles = makeStyles(({ spacing }) => ({
  header: {
    // backgroundColor: '#d6cfcb',
    backgroundColor: "#f7f6f5",
    padding: spacing(4, 6, 6, 6),
    height: '6em',
    borderRadius: '4px',
  },
  title: {
    margin: 0,
    color: '#565264',
    // color: 'white',
  },
}))

const DashboardHeader: React.FC = () => {
  const classes = useStyles()

  return (
    <Box display='flex' justifyContent='center' alignItems='center' className={classes.header}>
      {/* <Typography align='center' variant='h1' className={classes.title}>Hack the North 2022</Typography> */}
      <Typography align='center' variant='h1' className={classes.title}>Lifeline</Typography>
    </Box>
  )
}

export default DashboardHeader
