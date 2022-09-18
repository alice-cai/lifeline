import React, { useState, useEffect } from 'react'
import { Box, makeStyles, Grid } from '@material-ui/core'
import DashboardHeader from './dashboard-header.component'
import DataCardComponent from './data-card.component'
import MessagesComponent from './messages-card.component'
import { Database } from 'firebase/database'
import TemperatureCardComponent from './temperature-card.component'
import HumidityCardComponent from './humidity-card.component'
import PressureCardComponent from './pressure-card.component'
import AltitudeCardComponent from './altitude-card.component'
import AccelerationCardComponent from './acceleration-card.component'
import RotationCardComponent from './rotation-card.component'
import CompassCardComponent from './compass-card.component'
import RedLightCardComponent from './red-light-card.component'
import InfraredCardComponent from './infrared-light-card.component'

const useStyles = makeStyles(({ spacing }) => ({
    root: {
        backgroundColor: '#706677',
        padding: spacing(6, 8, 8, 6),
        minHeight: '100vh',
    },
}))

interface Props {
    firebaseDb: Database
}

const DashboardContainer: React.FC<Props> = ({ firebaseDb }) => {
    const classes = useStyles()
    
    const messages = [
        "this is a test string. I am sending a message.",
        "this is another test!",
        "testing testing testing~!!!!",
    ]

    return (
        <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={3}
            className={classes.root}
        >
            <Grid item xs={12}>
                <DashboardHeader />
            </Grid>
            <Grid item xs={6}>
                <DataCardComponent title={'GPS'} value="43.4643° N, 80.5204° W" />
            </Grid>
            <Grid item xs={6}>
                <CompassCardComponent firebaseDb={firebaseDb}/>
            </Grid>
            <Grid item xs={12}>
                <TemperatureCardComponent firebaseDb={firebaseDb}/>
            </Grid>
            <Grid item xs={12}>
                <HumidityCardComponent firebaseDb={firebaseDb}/>
            </Grid>
            <Grid item xs={3}>
                <AltitudeCardComponent firebaseDb={firebaseDb}/>
            </Grid>
            <Grid item xs={3}>
                <PressureCardComponent firebaseDb={firebaseDb} />
            </Grid>
            <Grid item xs={3}>
                <AccelerationCardComponent firebaseDb={firebaseDb} />
            </Grid>
            <Grid item xs={3}>
                <RotationCardComponent firebaseDb={firebaseDb} />
            </Grid>
            <Grid item xs={6}>
                <InfraredCardComponent firebaseDb={firebaseDb} />
            </Grid>
            <Grid item xs={6}>
                <RedLightCardComponent firebaseDb={firebaseDb} />
            </Grid>
            {/* <Grid item xs={4}>
                <AccelerationCardComponent firebaseDb={firebaseDb} />
            </Grid>
            <Grid item xs={4}>
                <RotationCardComponent firebaseDb={firebaseDb} />
            </Grid> */}
            <Grid item xs={12}>
                <MessagesComponent /*messages={messages}*/ firebaseDb={firebaseDb}/>
            </Grid>
        </Grid>
    )
}

export default DashboardContainer