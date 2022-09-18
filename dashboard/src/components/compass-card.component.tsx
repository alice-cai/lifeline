import React, { useState, useEffect } from 'react'
import { Box, makeStyles, Typography, Grid } from '@material-ui/core'
import ChartComponent from './chart.component'
import DataCardComponent from './data-card.component'
import { classicNameResolver } from 'typescript'
import { getDatabase, ref, child, onValue, Database, get } from "firebase/database";
import './compass.sass'

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    backgroundColor: '#d6cfcb',
    padding: spacing(4, 1, 1, 1),
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

enum Direction {
  N,
  NE,
  E,
  SE,
  S,
  SW,
  W,
  NW,
}

const CompassCardComponent: React.FC<Props> = ({ firebaseDb }) => {
  const classes = useStyles()
  const [pressure, setPressure] = useState<number>(0)

  const pressureRef = ref(firebaseDb, 'rx_module0/pressure');
  useEffect(() => {
    get(pressureRef).then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        const data = snapshot.val()
        setPressure(getLatestPressure(data))
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  });

  useEffect(() => {
    const id = setInterval(() => {
      get(pressureRef).then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          const data = snapshot.val()
          setPressure(getLatestPressure(data))
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

  let direction: Direction = Direction.N
  if (pressure >= 0 && pressure < 22) {
    direction = Direction.N
  } else if ((pressure >= 22 && pressure < 67) || (pressure >= 338 && pressure < 360)) {
    direction = Direction.NE
  } else if (pressure >= 67 && pressure < 111) {
    direction = Direction.E
  } else if (pressure >= 111 && pressure < 157) {
    direction = Direction.SE
  } else if (pressure >= 157 && pressure < 202) {
    direction = Direction.S
  } else if (pressure >= 202 && pressure < 247) {
    direction = Direction.SW
  } else if (pressure >= 247 && pressure < 292) {
    direction = Direction.W
  }
  else if (pressure >= 247 && pressure < 338) {
    direction = Direction.NW
  }

  return (
    <DataCardComponent title="Compass">
      <Typography align='center' variant='h6' className={classes.value}>{`${pressure}° ${Direction[direction]}`}</Typography>
      {/* <div className="app">
        <div className="compass">
          <div className="arrows"></div>
          <div className="dt-n-s"></div>
          <div className="dt-w-e"></div>
        </div>
      </div> */}
    </DataCardComponent>
  )
}

const getLatestPressure = (rawPressureData: { [key: string]: string; }) => {
  const prefix = "c "
  const pressureList = Object.values(rawPressureData)
  const latestPressureString = pressureList[pressureList.length - 1].substring(prefix.length)
  return parseFloat(latestPressureString) / 1000.0
}

export default CompassCardComponent
