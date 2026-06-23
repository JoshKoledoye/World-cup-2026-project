import { BrowserRouter, Route } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/react";
import Everything from "./Everything";

export default function App() {
  return (
    <BrowserRouter>
      <Route path="/">
        <Everything />
      </Route>
      <Route path="/login">
        <SignIn />
      </Route>
      <Route path="/sign-up">
        <SignUp />
      </Route>
    </BrowserRouter>
  );
}
