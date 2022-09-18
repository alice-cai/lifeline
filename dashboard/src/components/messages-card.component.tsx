import React, { useState, useEffect, useRef } from 'react'
import { Box, makeStyles, Typography, Grid } from '@material-ui/core'
import ChartComponent from './chart.component'
import DataCardComponent from './data-card.component'
import { classicNameResolver } from 'typescript'
import { getDatabase, ref, child, onValue, Database, get } from "firebase/database";

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    // backgroundColor: '#d6cfcb',
    backgroundColor: "#f7f6f5",
    padding: spacing(0, 2, 1, 2),
    borderRadius: '4px',
    maxHeight: '20rem',
    overflow: 'hidden',
    overflowY: 'scroll',
    marginTop: spacing(2)
  },
  messsageContainer: {
    // backgroundColor: '#a6808c',
    borderRadius: '4px',
    padding: spacing(1, 2, 1, 2),
  },
  message: {
    margin: 0,
    // color: "#d6cfcb",
    color: '#a6808c',
  },
  timeStamp: {
    margin: 0,
    color: "#565264",
    fontSize: "1.1em",
  }
}))

interface Props {
  messages?: string[],
  firebaseDb: Database,
}

interface Message {
  timestamp: string,
  content: string,
}

const MessagesComponent: React.FC<Props> = ({ firebaseDb }) => {
  const classes = useStyles()
  const [messages, setMessages] = useState<Message[]>([])

  const testRef = ref(firebaseDb, 'rx_module0/msg');
  // useEffect(() => {
  //   get(testRef).then((snapshot) => {
  //     if (snapshot.exists()) {
  //       console.log(snapshot.val());
  //       const data = snapshot.val()
  //       const newMessages = convertRawDataToMessage(data, messages.length)
  //       setMessages([...messages, ...newMessages])
  //     } else {
  //       console.log("No data available");
  //     }
  //   }).catch((error) => {
  //     console.error(error);
  //   });
  // });
  useEffect(() => {
    const id = setInterval(() => {
      get(testRef).then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          const data = snapshot.val()
          const newMessages = convertRawDataToMessage(data, messages.length)
          setMessages([...messages, ...newMessages])
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

  // const messagesRootRef = useRef<HTMLDivElement>(null)

  // const scrollToBottom = () => {
  //   if (messagesRootRef.current) {
  //     messagesRootRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
  //   }
  // }
  // useEffect(scrollToBottom, [messages])

  return (
    <DataCardComponent title="Messages">
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        className={classes.root}
        // ref={messagesRootRef}
      >
        {messages.map(message => (
          <>
            <Grid item xs={2}>
              <Typography align='left' variant='h6' className={classes.timeStamp}>{message.timestamp}</Typography>
            </Grid>
            <Grid item xs={10}>
              <Box className={classes.messsageContainer}>
                <Typography align='left' variant='h6' className={classes.message}>{message.content}</Typography>
              </Box>
            </Grid>
          </>
        ))}
      </Grid>
    </DataCardComponent>
  )
}

const convertRawDataToMessage = (testData: { [key: string]: string; }, numExistingMessages: number) => {
  const prefix = "m "
  const messages: Message[] = []
  const newMessages = Object.values(testData).slice(numExistingMessages) // only look at the new ones

  for (const msg of newMessages) {
    const newMessage = decodeURI(msg.substring(prefix.length)) // or str.replace(/%20/g, " ");

    const message: Message = {
      timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
      content: newMessage,
    }
    messages.push(message)
  }
  return messages
}

export default MessagesComponent
