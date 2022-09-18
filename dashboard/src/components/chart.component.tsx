import React, { useState, useEffect } from 'react'
import { Box, makeStyles, Typography } from '@material-ui/core'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";
import {Temperature} from './temperature-card.component'

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    padding: spacing(4, 6, 6, 6),
    height: '6em',
    // width: '8em',
    // width: '100%',
    borderRadius: '4px',
  },
  title: {
    margin: 0,
  },
  warning: {
    backgroundColor: 'red',
  },
}))

interface Props {
  data: number[],
  timestamps: string[],
  temperatureData?: Temperature[],
  temperature?: boolean,
  humidity?: boolean,
  warning?: boolean,
  small?: boolean,
}

interface TemperatureData {
  dateTime: string,
  temperature: number,
}

interface HumidityData {
  dateTime: string,
  humidity: number,
}

const temperatureData: TemperatureData[] = [
  {
    dateTime: "Sept 14 2:00",
    temperature: 15,
  },
  {
    dateTime: "Sept 14 3:00",
    temperature: 21.2,
  },
  {
    dateTime: "Sept 14 4:00",
    temperature: 20,
  },
  {
    dateTime: "Sept 14 5:00",
    temperature: 11,
  },
  {
    dateTime: "Sept 14 6:00",
    temperature: 25,
  },
];

const ChartComponent: React.FC<Props> = ({ data, temperatureData, timestamps, temperature, humidity, warning, small }) => {
  const classes = useStyles()

  // take only last 100
  const numDataEntries =
  data = data.slice(data.length - 100, data.length)
  if (small) {
    data = data.slice(data.length - 10, data.length)
  }

  const tempData = data.map((temp, index) => {
    return {
      timestamps,
      temperature: temp,
    }
  })

  const humidityData = data.map((humidity, index) => {
    return {
      timestamps,
      humidity: humidity,
    }
  })

  return (
    <LineChart
      width={small ? 550 : 1200}
      height={small ? 200 : 300}
      data={temperature ? tempData : humidityData}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 10
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamps" />
      <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey={temperature ? 'temperature' : 'humidity'}
        stroke="#a6808c"
        activeDot={{ r: 8 }}
        strokeWidth={3}
      />
      {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
    </LineChart>
  );
}

export default ChartComponent
