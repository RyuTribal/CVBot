import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import Auth from "@aws-amplify/auth";
import Analytics from "@aws-amplify/analytics";
import Amplify, { Interactions } from "aws-amplify";
import { ChatBot, AmplifyTheme } from "aws-amplify-react";

import awsconfig from "./aws-exports";

Auth.configure(awsconfig);

Analytics.configure(awsconfig);

Amplify.configure(awsconfig);

Interactions.configure(awsconfig);

const myTheme = {
  ...AmplifyTheme,
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    backgroundColor: "#ff6600"
  }
};

// Amplify.configure({
//   Auth: {
//     identityPoolId: "eu-west-1:fd4c13e8-455f-4b8a-8303-3fac15b34580",
//     region: "eu-west-1"
//   },
//   Interactions: {
//     bots: {
//       VanBot_dev: {
//         name: "VanBot_dev",
//         alias: "$LATEST",
//         region: "eu-west-1"
//       }
//     }
//   }
// });

class App extends Component {
  handleComplete(err, confirmation) {
    if (err) {
      alert("Bot conversation failed");
      return;
    }

    alert("Success: " + JSON.stringify(confirmation, null, 2));
    return "Trip booked. Thank you! what would you like to do next?";
  }

  render() {
    return (
      <div className="App">
        <ChatBot
          title="VanBot"
          theme={myTheme}
          botName="VanBot_dev"
          welcomeMessage="Welcome to Ivan's interactive CV. Please ask anything regarding the js master"
          onComplete={this.handleComplete.bind(this)}
          clearOnComplete={true}
          conversationModeOn={true}
        />
      </div>
    );
  }
}

export default App;
