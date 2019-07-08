import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import Auth from "@aws-amplify/auth";
import Analytics from "@aws-amplify/analytics";
import Amplify, { Interactions } from "aws-amplify";
import { ChatBot, AmplifyTheme } from "aws-amplify-react";
import { ChatFeed, Message } from "react-chat-ui";
import {
  Widget,
  addResponseMessage,
  addLinkSnippet,
  addUserMessage,
  setQuickButtons
} from "react-chat-widget";

import "react-chat-widget/lib/styles.css";

import profile from "./img/android.jpg";

import awsconfig from "./aws-exports";

import $ from "jquery";

Auth.configure(awsconfig);

Analytics.configure(awsconfig);

Amplify.configure(awsconfig);

Interactions.configure(awsconfig);

class App extends Component {
  componentDidMount() {
    addResponseMessage(
      "Welcome to Ivan's interactive CV. Please ask anything regarding the owner"
    );
  }

  handleNewUserMessage = newMessage => {
    this.newMessage(newMessage);
  };

  newMessage(newMessage) {
    $.ajax({
      type: "POST",
      url: "https://api.dialogflow.com/v1/query?v=20170712",
      contentType: "application/json; charset=utf-8",
      headers: {
        Authorization: "Bearer 71adca6fa5be465fa880deed71d1aab8"
      },
      data: JSON.stringify({
        query: newMessage,
        lang: "en",
        sessionId: "job-interview-dtlxkt"
      }),
      success: function(response) {
        console.log(response);
        var messageArr = response.result.fulfillment.messages;
        for (var i = 0; i < messageArr.length; i++) {
          addResponseMessage(messageArr[i].speech);
        }
      },
      error: function() {}
    });
  }

  render() {
    return (
      <div className="App">
        <Widget
          handleNewUserMessage={this.handleNewUserMessage}
          title="VanBot"
          subtitle="Interactive CV bot"
          profileAvatar={profile}
        />
      </div>
    );
  }
}

$(document).ready(function() {
  $(".rcw-widget-container").addClass("rcw-opened");
  $(".rcw-launcher").trigger("click");
  $(".rcw-close-button").remove();
  $(".rcw-launcher").remove();
});

const styles = {
  bubbleStyles: {
    text: {
      fontSize: 16
    },
    chatbubble: {
      borderRadius: 30,
      padding: 10
    }
  },
  headerTitle: {
    color: "white",
    fontSize: 22
  },
  header: {
    backgroundColor: "rgb(0, 132, 255)",
    padding: 20,
    borderTop: "12px solid rgb(204, 204, 204)"
  },
  messagesContainer: {
    display: "flex",
    flexDirection: "column",
    padding: 10,
    alignItems: "center"
  },
  input: {
    fontSize: 16,
    padding: 10,
    outline: "none",
    width: 350,
    border: "none",
    borderBottom: "2px solid rgb(0, 132, 255)"
  }
};

export default App;
