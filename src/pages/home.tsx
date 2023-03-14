import { useState } from 'preact/hooks'
import linkState from 'linkstate';
import '../styles/home.scss'
import { Component, FunctionComponent } from 'preact'
import ApiLayer from '../api/api'
import { futureEvent } from '../api/api.types'
import { Table } from '../components/table';

type Props = {
  selectedEventID: number
};
type State = {
  events: futureEvent[],
  selectedEventID: number | null
};

export class Home extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      events: [],
      selectedEventID: null
    };

    ApiLayer.getEvents().then(ev => {
      this.setState({
        events: ev.data.events,
        selectedEventID: this.state.selectedEventID ?? ev.data.events.length == 1 ? ev.data.events[0].eventID : null
      });
    });
  }
  getSelectedEvent() {
    for (let event of this.state.events) {
      if (event.eventID == this.state.selectedEventID) {
        return event;
      }
    }
  }
  toLocalDate(dateString: string | undefined) {
    if (!dateString) {
      return '';
    }
    return (new Date(dateString).toLocaleString());
  }
  render() {
    return (
      <>
        <div className="legend">
          <label>
            Selected event:
            <select onChange={linkState(this, 'selectedEventID')}>
              {this.state.events.map(event => {
                return <option value={event.eventID}>{event.title}</option>
              })}
            </select>
          </label>
          <label className="info">Applications from: <span>{this.toLocalDate(this.getSelectedEvent()?.appBegin)}</span></label>
          <label className="info">To: <span>{this.toLocalDate(this.getSelectedEvent()?.appEnd)}</span></label>
        </div>
              
      </>
    )
  }
}
