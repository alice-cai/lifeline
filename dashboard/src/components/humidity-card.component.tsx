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
  }
}))

interface Props {
  messages?: string[],
  firebaseDb: Database,
}

interface Humidity {
  timestamp: string,
  value: number,
}

const HumidityCardComponent: React.FC<Props> = ({ firebaseDb }) => {
  const classes = useStyles()
  const [humidities, setHumidities] = useState<Humidity[]>([])
  const [count, setCount] = useState<number>(0)

  const temperatureRef = ref(firebaseDb, 'rx_module0/humidity');
  useEffect(() => {
    get(temperatureRef).then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        const data = snapshot.val()
        const newTemperatures = parseTemperatures(data, humidities.length, count)
        setCount(count + 1)
        setHumidities([...newTemperatures])
        // setHumidities(parseHumidities(data))
        console.log([...newTemperatures])
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
    <DataCardComponent title="Humidity">
      <ChartComponent humidity data={humidities.map(h => h.value)} timestamps={humidities.map(h => h.timestamp)}/>
    </DataCardComponent>
  )
}

// const parseHumidities = (rawHumidityData: { [key: string]: string; }): number[] => {
//   const prefix = "humidity "
//   const humidities: number[] = []
//   for (const [key, value] of Object.entries(rawHumidityData)) {
//     const humidityString = value.substring(prefix.length)
//     const humidity = parseFloat(humidityString)
//     if (humidity !== NaN) {
//       humidities.push(humidity)
//     }
//   }
//   return humidities
// }

const parseTemperatures = (rawTempertaureData: { [key: string]: string; }, currentNumTemperatures: number, numTimesCalling: number): Humidity[] => {
  const prefix = "humidity "
  const newTemperatures: Humidity[] = []

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
    count++
  }

  // TODO: remove. for testing warning
  // temperatures.push(36.0)

  return newTemperatures
}

export default HumidityCardComponent
