import React, { useState, useEffect } from 'react'
import { Box, makeStyles, Typography } from '@material-ui/core'
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Temperature } from './temperature-card.component'

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
  data: Temperature[],
  temperature?: boolean,
  humidity?: boolean,
  warning?: boolean,
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

const Chart2Component: React.FC<Props> = ({ data, temperature, humidity, warning }) => {
  const classes = useStyles()

  // useEffect(() => {
  //   window.setInterval(() => {      
  //     ApexCharts.exec('realtime', 'updateSeries', [{
  //       data: data.map(data => data.value)
  //     }])
  //   }, 1000)
  // })

  // useEffect(() => {
  //   window.setInterval(() => {
  //     getNewSeries(lastDate, {
  //       min: 10,
  //       max: 90
  //     })
      
  //     ApexCharts.exec('realtime', 'updateSeries', [{
  //       data: data
  //     }])
  //   }, 1000)
  // });

  const tempData = data.map((temp, index) => {
    return {
      index,
      temperature: temp,
    }
  })

  const humidityData = data.map((humidity, index) => {
    return {
      index,
      humidity: humidity,
    }
  })

  const temperatureState = {
    options: {
      chart: {
        id: 'temperature'
      },
      xaxis: {
        categories: []
      }
    },
    series: [{
      name: 'temperature',
      data: data.map((temp, index) => temp)
    }]
  }

  const humidityState = {
    options: {
      chart: {
        id: 'humidity'
      },
      xaxis: {
        categories: data.map((temp, index) => index)
      }
    },
    series: [{
      name: 'humidity',
      data: data.map((temp, index) => temp)
    }]
  }

  const dynamicStateOptions: ApexOptions = {
    chart: {
      id: 'realtime',
      height: 350,
      type: 'line',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 1000
        }
      },
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth'
    },
    title: {
      text: 'Dynamic Updating Chart',
      align: 'left'
    },
    markers: {
      size: 0
    },
    xaxis: {
      type: 'datetime',
      range: 100,
    },
    yaxis: {
      min: (min) => min,
      max: (max) => max,
    },
    legend: {
      show: false
    },
  }

  const dynamicState = {
    series: [{
      data: data.map(data => data.value).slice()
    }],
    options: dynamicStateOptions
  };

  const lineChartStateOptions: ApexOptions = {
    chart: {
      height: 350,
      type: 'line',
      dropShadow: {
        enabled: true,
        color: '#000',
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2
      },
      toolbar: {
        show: false
      }
    },
    colors: ['#77B6EA', '#545454'],
    dataLabels: {
      enabled: true,
    },
    stroke: {
      curve: 'smooth'
    },
    title: {
      text: 'Temperature',
      align: 'left'
    },
    grid: {
      borderColor: '#e7e7e7',
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5
      },
    },
    markers: {
      size: 1
    },
    // xaxis: {
    //   categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    //   title: {
    //     text: 'Month'
    //   }
    // },
    yaxis: {
      title: {
        text: 'Temperature'
      },
      min: 5,
      max: 40
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: -25,
      offsetX: -5
    }
  };

  const lineChartState = {
    series: [
      {
        name: "Temperature",
        data: data.map((temp, index) => temp)
      }
    ],
    options: lineChartStateOptions
  };

  const chartState = temperature ? temperatureState : humidityState

  return (
    <ReactApexChart options={dynamicState.options} series={dynamicState.series} type="line" width={1200} height={300} />
  );
}

export default Chart2Component
