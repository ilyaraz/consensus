import React from "react";
import { Container, Row, Col } from "react-bootstrap";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      version: null,
      snapshotValue: null,
      sentValue: null,
      modifiedValue: null,
    };
  }

  sync() {
    if (this.state.version === null) {
      return;
    }
    if (this.state.sentValue === null) {
      if (this.state.modifiedValue === null) {
        var toSend = { version: this.state.version };
        this.setState({ ...this.state, sentValue: this.state.snapshotValue });
        fetch("/back/update/", {
          method: "post",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(toSend),
        })
          .then((data) => data.json())
          .then((data) => {
            if (data["updated"]) {
              this.setState({
                version: data.version,
                snapshotValue: data.snapshotValue,
                sentValue: null,
                modifiedValue: null,
              });
            } else {
              this.setState({ ...this.state, sentValue: null });
            }
          });
      } else {
        var toSend = {
          version: this.state.version,
          proposedValue: this.state.modifiedValue,
        };
        this.setState({
          ...this.state,
          sentValue: this.state.modifiedValue,
          modifiedValue: null,
        });
        fetch("/back/propose/", {
          method: "post",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(toSend),
        })
          .then((data) => data.json())
          .then((data) => {
            if (data["accepted"]) {
              this.setState({
                ...this.state,
                version: this.state.version + 1,
                snapshotValue: toSend.proposedValue,
                sentValue: null,
              });
            } else {
              this.setState({
                version: data.version,
                snapshotValue: data.snapshotValue,
                sentValue: null,
                modifiedValue: null,
              });
            }
          });
      }
    } else {
    }
  }

  runPolling() {
    this.interval = setInterval(() => this.sync(), 1);
  }

  componentDidMount() {
    fetch("/back/handshake/")
      .then((data) => data.json())
      .then((data) => this.setState({ ...this.state, ...data }))
      .then(this.runPolling());
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  updateValue(evt) {
    var newValue = evt.target.value;
    this.setState({ ...this.state, modifiedValue: newValue });
  }

  render() {
    var toOutput = null;
    if (this.state.version === null) {
      toOutput = <p>Loading...</p>;
    } else {
      var value = null;
      if (this.state.modifiedValue !== null) {
        value = this.state.modifiedValue;
      } else if (this.state.sentValue !== null) {
        value = this.state.sentValue;
      } else {
        value = this.state.snapshotValue;
      }
      toOutput = (
        <textarea
          value={value}
          onChange={(evt) => this.updateValue(evt)}
          rows="10"
          cols="30"
        />
      );
    }
    return (
      <Container>
        <Row>
          <Col>
            <div className="d-flex justify-content-center">{toOutput}</div>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
