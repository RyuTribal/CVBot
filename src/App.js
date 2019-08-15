import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import Auth from "@aws-amplify/auth";
import Analytics from "@aws-amplify/analytics";
import Amplify, { Interactions } from "aws-amplify";
import {
  Widget,
  addResponseMessage,
  addLinkSnippet,
  addUserMessage,
  setQuickButtons,
  renderCustomComponent
} from "react-chat-widget";

import "jquery-ui";

import "./commercial/font-awesome/css/all.css";

import "react-chat-widget/lib/styles.css";

import profile from "./img/android.jpg";

import awsconfig from "./aws-exports";

import $ from "jquery";

import Recorder from "opus-recorder";

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
    this.detectLang(newMessage);
  };

  detectLang(newMessage) {
    $.ajax({
      type: "POST",
      url:
        "https://www.googleapis.com/language/translate/v2/detect?key=AIzaSyDJfp0Sztdi_m4skJ1dBSH1JtvVtMYdxlE&q=" +
        newMessage,
      dataType: "jsonp",
      success: function(response) {
        var srcLang = response.data.detections[0][0].language;
        translateText(newMessage, srcLang);
      },
      error: function() {}
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      record: false
    };
  }

  onData(recordedBlob) {
    console.log("chunk of real-time data is: ", recordedBlob);
  }

  onStop(recordedBlob) {
    console.log("recordedBlob is: ", recordedBlob);
    sendAudio(recordedBlob);
  }

  startRecording = () => {
    this.setState({
      record: true
    });
  };

  stopRecording = () => {
    this.setState({
      record: false
    });
  };

  render() {
    return (
      <div className="App">
        <Widget
          handleNewUserMessage={this.handleNewUserMessage}
          startRecording={this.startRec}
          stopRecording={this.stopRec}
          title="VanBot"
          mic={true}
          subtitle="Interactive CV bot"
          profileAvatar={profile}
        />

        <audio id="player" controls />
      </div>
    );
  }
}

function translateText(newMessage, srcLang) {
  if (srcLang == "en") {
    createEngMessage(newMessage);
  } else {
    $.ajax({
      type: "POST",
      url:
        "https://www.googleapis.com/language/translate/v2?key=AIzaSyDJfp0Sztdi_m4skJ1dBSH1JtvVtMYdxlE&source=" +
        srcLang +
        "&target=en&q=" +
        newMessage,
      dataType: "jsonp",
      success: function(response) {
        var engText = response.data.translations[0].translatedText;
        createTransMessage(engText, srcLang, newMessage);
      },
      error: function() {}
    });
  }
}

async function sendAudio(recordedBlob) {
  // var arrayBuffer = await new Response(recordedBlob).arrayBuffer();
  // var floatbuff = arrayBuffer.decodeAudioData(ArrayBuffer);
  // console.log(floatbuff)
  let fileReader = new FileReader();
  let arrayBuffer;

  fileReader.onloadend = () => {
    arrayBuffer = fileReader.result;
    console.log(arrayBuffer);
  };

  fileReader.readAsArrayBuffer(recordedBlob);
  $.ajax({
    type: "POST",
    url: "http://localhost:4242/api/1.0/post",
    dataType: "arraybuffer",
    data: {
      blob: arrayBuffer
    },
    success: function(response) {
      console.log(response);
    },
    error: function() {}
  });
}

function translateRes(text, srcLang) {
  $.ajax({
    type: "POST",
    url:
      "https://www.googleapis.com/language/translate/v2?key=AIzaSyDJfp0Sztdi_m4skJ1dBSH1JtvVtMYdxlE&source=en&target=" +
      srcLang +
      "&q=" +
      text,
    dataType: "json",
    async: false,
    success: function(response) {
      var srcText = response.data.translations[0].translatedText;
      addResponseMessage(srcText);
    },
    error: function() {}
  });
}

function createEngMessage(newMessage) {
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
      if (
        response.result.metadata.intentName ==
        "translate.text - context:translate-text - comment:to language"
      ) {
        var langTo = response.result.parameters["lang-to"];
        var text = response.result.parameters["text"];
      } else {
        for (var i = 0; i < messageArr.length; i++) {
          addResponseMessage(messageArr[i].speech);
        }
      }
    },
    error: function() {}
  });
}

function createTransMessage(engText, srcLang, newMessage) {
  $.ajax({
    type: "POST",
    url: "https://api.dialogflow.com/v1/query?v=20170712",
    contentType: "application/json; charset=utf-8",
    headers: {
      Authorization: "Bearer 71adca6fa5be465fa880deed71d1aab8"
    },
    data: JSON.stringify({
      query: engText,
      lang: "en",
      sessionId: "job-interview-dtlxkt"
    }),
    success: function(response) {
      console.log(response);
      var messageArr = response.result.fulfillment.messages;
      if (
        response.result.metadata.intentName ==
        "translate.text - context:translate-text - comment:to language"
      ) {
        var langTo = response.result.parameters["lang-to"];
        var text = response.result.parameters["text"];
      } else {
        for (var i = 0; i < messageArr.length; i++) {
          translateRes(messageArr[i].speech, srcLang);
        }
      }
    },
    error: function() {}
  });
}

function startRecording() {
  console.log("recording start");
}

$(document).ready(function() {
  navigator.mediaDevices
    .getUserMedia(
      // constraints - only audio needed for this app
      {
        audio: true
      }
    )

    // Success callback
    .then(function(stream) {
      console.log(navigator.mediaDevices.getSupportedConstraints());
      var mediaRecorder = new MediaRecorder(stream, { sampleRate: 44100 });
      var chunks = [];
      $(".rec-button")
        .mousedown(function() {
          console.log("rec start");
          $(".rec-button i").addClass("recStart");
          mediaRecorder.start();
          console.log(mediaRecorder.state);
          console.log("recorder started");
        })
        .mouseup(function() {
          console.log("rec end");
          $(".rec-button i").removeClass("recStart");
          mediaRecorder.stop();
          mediaRecorder.ondataavailable = function(e) {
            chunks.push(e.data);
            var blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
            var player = document.getElementById("player");
            player.src = URL.createObjectURL(blob);
            chunks = [];
            var reader = new window.FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function() {
              var base64 = reader.result;
              var audioArr = {
                audio: base64
              };
              $.ajax({
                url: "http://localhost:4242/api/1.0/post",
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify(audioArr),
                success: function(response) {
                  console.log(response);
                },
                error: function(err) {
                  console.log(err);
                }
              });
            };
            console.log(mediaRecorder.state);
            console.log("recorder stopped");
          };
        });
    })

    // Error callback
    .catch(function(err) {
      console.log("The following getUserMedia error occured: " + err);
    });
  $(".rcw-widget-container").addClass("rcw-opened");
  $(".rcw-launcher").trigger("click");
  $(".rcw-close-button").remove();
  $(".rcw-launcher").remove();
  $(".rcw-sender").prepend(
    $('<button class="rec-button">').append($('<i class="fas fa-microphone">'))
  );
});

export default App;
