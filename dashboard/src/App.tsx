import './App.css';

import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, get } from "firebase/database";
import { MuiThemeProvider } from '@material-ui/core/styles'
import { theme } from './theme/theme'
import DashboardContainer from './components/dashboard-container.component'

const firebaseConfig = {
  databaseURL: "https://hackthenorth2022-8888-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);
const dbRef = ref(database);

const testRef = ref(database, `max/test/`);

get(child(dbRef, `max/test/`)).then((snapshot) => {
  if (snapshot.exists()) {
    console.log(snapshot.val());
  } else {
    console.log("No data available");
  }
}).catch((error) => {
  console.error(error);
});

function App() {
  return (
    <MuiThemeProvider theme={theme}>
        {/* <header className="App-header"></header> */}
        <DashboardContainer firebaseDb={database} />
    </MuiThemeProvider>
  );
}

export default App;
