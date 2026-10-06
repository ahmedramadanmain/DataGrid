import "./App.css";
import User from "./Pages/User/User";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <User />
    </QueryClientProvider>
  );
}

export default App;
