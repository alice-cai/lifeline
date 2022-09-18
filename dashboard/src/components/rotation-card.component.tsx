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
    marginLeft: "2.5em",
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

const RotationCardComponent: React.FC<Props> = ({ firebaseDb }) => {
  const classes = useStyles()
  const [accelerationX, setAccelerationX] = useState<number>(0)
  const [accelerationY, setAccelerationY] = useState<number>(0)
  const [accelerationZ, setAccelerationZ] = useState<number>(0)

  const accelerationXRef = ref(firebaseDb, 'rx_module0/x rotation');
  const accelerationYRef = ref(firebaseDb, 'rx_module0/y rotation');
  const accelerationZRef = ref(firebaseDb, 'rx_module0/z rotation');
  // useEffect(() => {
  //   get(accelerationXRef).then((snapshot) => {
  //     if (snapshot.exists()) {
  //       console.log(snapshot.val());
  //       const data = snapshot.val()
  //       setAccelerationX(getLatestAcceleration(data))
  //     } else {
  //       console.log("No data available");
  //     }
  //   }).catch((error) => {
  //     console.error(error);
  //   });

  //   get(accelerationYRef).then((snapshot) => {
  //     if (snapshot.exists()) {
  //       console.log(snapshot.val());
  //       const data = snapshot.val()
  //       setAccelerationY(getLatestAcceleration(data))
  //     } else {
  //       console.log("No data available");
  //     }
  //   }).catch((error) => {
  //     console.error(error);
  //   });

  //   get(accelerationZRef).then((snapshot) => {
  //     if (snapshot.exists()) {
  //       console.log(snapshot.val());
  //       const data = snapshot.val()
  //       setAccelerationZ(getLatestAcceleration(data))
  //     } else {
  //       console.log("No data available");
  //     }
  //   }).catch((error) => {
  //     console.error(error);
  //   });
  // });

  useEffect(() => {
    const id = setInterval(() => {
      get(accelerationXRef).then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          const data = snapshot.val()
          setAccelerationX(getLatestAcceleration(data))
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });

      get(accelerationYRef).then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          const data = snapshot.val()
          setAccelerationY(getLatestAcceleration(data))
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });

      get(accelerationZRef).then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          const data = snapshot.val()
          setAccelerationZ(getLatestAcceleration(data))
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });
    }, 250);

    return () => clearInterval(id);
  }, []);

  return (
    <DataCardComponent title="Rotation">
      <Typography align='left' variant='h6' className={classes.value}>{`X: ${accelerationX} rad/s`}</Typography>
      <Typography align='left' variant='h6' className={classes.value}>{`Y: ${accelerationY} rad/s`}</Typography>
      <Typography align='left' variant='h6' className={classes.value}>{`Z: ${accelerationZ} rad/s`}</Typography>
    </DataCardComponent>
  )
}

const getLatestAcceleration = (rawAltitudeData: { [key: string]: string; }) => {
  const prefix = "ax "
  const altitudeList = Object.values(rawAltitudeData)
  const latestAltitudeString = altitudeList[altitudeList.length - 1].substring(prefix.length)
  return parseFloat(latestAltitudeString)
}

export default RotationCardComponent
