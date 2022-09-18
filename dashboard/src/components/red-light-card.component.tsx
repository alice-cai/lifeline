import React, { useState, useEffect } from 'react'
import { Box, makeStyles, Typography, Grid } from '@material-ui/core'
import ChartComponent from './chart.component'
import Chart2Component from './chart2.component'
import DataCardComponent from './data-card.component'
import { classicNameResolver } from 'typescript'
import { getDatabase, ref, child, onValue, Database, get } from "firebase/database";
import { time } from 'console'

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
  warning: {
    backgroundColor: 'red',
  }
}))

interface Props {
  messages?: string[],
  firebaseDb: Database,
}

export interface Temperature {
  timestamp: string,
  value: number,
}

const RedLightCardComponent: React.FC<Props> = ({ firebaseDb }) => {
  const classes = useStyles()
  const [temperatures, setTemperatures] = useState<Temperature[]>([])
  const [warning, setWarning] = useState<boolean>(false)

  const temperatureRef = ref(firebaseDb, 'rx_module0/red light');
  useEffect(() => {
      get(temperatureRef).then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          const data = snapshot.val()
          const newTemperatures = parseTemperatures(data, temperatures.length)
          setTemperatures([...newTemperatures])
          console.log(temperatures)
          const latestTemperature = temperatures[temperatures.length - 1]
          if (latestTemperature.value > 35.0) {
            setWarning(true)
          } else {
            setWarning(false)
          }
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });
  });
  // onValue(testRef, (snapshot) => {
  //   const data = snapshot.val();
  //   setMessages(convertTestDataToMessage(data))
  // });

  return (
    <DataCardComponent title="Red Light">
      <ChartComponent temperature data={temperatures.map(t => t.value)} timestamps={temperatures.map(t => t.timestamp)} temperatureData={temperatures} small />
    </DataCardComponent>
  )
}

const parseTemperatures = (rawTempertaureData: { [key: string]: string; }, currentNumTemperatures: number): Temperature[] => {
  const prefix = "rx "
  const newTemperatures: Temperature[] = []

  const rawTemperatureValues = Object.values(rawTempertaureData) //.slice(currentNumTemperatures)
  let count = 0;
  let now = new Date()
  now.setUTCMilliseconds(now.getUTCMilliseconds() - 10000)

  for (const newTemp of rawTemperatureValues) {
    if (count > 10) {
      now.setUTCMilliseconds(now.getUTCMilliseconds() + 1000)
      count = 0
    }
    const temperatureString = newTemp.substring(prefix.length)
    const temperature = parseFloat(temperatureString)
    if (!isNaN(temperature)) {
      newTemperatures.push({ timestamp: now.toLocaleTimeString(), value: temperature })
    }
    count++;
  }

  // TODO: remove. for testing warning
  // temperatures.push(36.0)

  return newTemperatures
}

export default RedLightCardComponent
