import React, { useState, useEffect } from 'react'
import { Box, makeStyles, Typography, Grid } from '@material-ui/core'
import ChartComponent from './chart.component'
import DataCardComponent from './data-card.component'
import { classicNameResolver } from 'typescript'
import { getDatabase, ref, child, onValue, Database, get } from "firebase/database";

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    backgroundColor: '#d6cfcb',
    padding: spacing(4, 1, 1, 1),
    // height: '6em',
    // width: '8em',
    // width: '100%',
    borderRadius: '4px',
  },
  messsageContainer: {
    backgroundColor: '#a6808c',
    borderRadius: '4px',
    padding: spacing(1, 2, 1, 2),
  },
  message: {
    margin: 0,
    color: "#d6cfcb",
  },
  timeStamp: {
    margin: 0,
    color: "#565264",
  },
  value: {
    marginTop: "0.3em",
    color: "#a6808c",
  },
}))

interface Props {
  messages?: string[],
  firebaseDb: Database,
}

interface Message {
  timestamp: string,
  content: string,
}

const AltitudeCardComponent: React.FC<Props> = ({ firebaseDb }) => {
  const classes = useStyles()
  const [altitude, setAltitude] = useState<number>(0)

  const pressureRef = ref(firebaseDb, 'rx_module0/altitude');
  // useEffect(() => {
  //   get(pressureRef).then((snapshot) => {
  //     if (snapshot.exists()) {
  //       console.log(snapshot.val());
  //       const data = snapshot.val()
  //       setAltitude(getLatestAltitude(data))
  //     } else {
  //       console.log("No data available");
  //     }
  //   }).catch((error) => {
  //     console.error(error);
  //   });
  // });

  useEffect(() => {
    const id = setInterval(() => {
      get(pressureRef).then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          const data = snapshot.val()
          setAltitude(getLatestAltitude(data))
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });
    }, 250);

    return () => clearInterval(id);
  }, []);

  // onValue(testRef, (snapshot) => {
  //   const data = snapshot.val();
  //   setMessages(convertTestDataToMessage(data))
  // });

  return (
    <DataCardComponent title="Altitude" taller>
      <Typography align='center' variant='h6' className={classes.value}>{`${altitude} m`}</Typography>
    </DataCardComponent>
  )
}

const getLatestAltitude = (rawAltitudeData: { [key: string]: string; }) => {
  const prefix = "l "
  const altitudeList = Object.values(rawAltitudeData)
  const latestAltitudeString = altitudeList[altitudeList.length - 1].substring(prefix.length)
  return parseFloat(latestAltitudeString)
}

export default AltitudeCardComponent
