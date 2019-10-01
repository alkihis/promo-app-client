import React from 'react';

interface TestProps {
  name: string;
}

interface TestState {
  message: string;
}

export default class Test extends React.Component<TestProps, TestState> {
  public state: TestState = { 
    message: "button clicked 0 times" 
  };

  protected comp = 0;

  incrementCompteur = () => {
    this.comp++;
    this.setState({
      message: `button clicked ${this.comp} times`
    });
  };

  render() {
    return (
      <div>
        Hello {this.props.name}, {this.state.message}.
        <button onClick={this.incrementCompteur}>Click me</button>
      </div>
    );
  }
}
