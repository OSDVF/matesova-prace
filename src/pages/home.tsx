import { useState } from 'preact/hooks'
import linkState from 'linkstate';
import '../styles/home.scss'
import { Component, FunctionComponent } from 'preact'
import ApiLayer from '../api/api'
import { application, futureEvent } from '../api/api.types'
import { Table, TableField } from '../components/table';

type Props = {
  selectedEventID: number
};
type State = {
  events: futureEvent[],
  selectedEventID: number | null
  applications: application[] | null
};

const fields: TableField[] = [
  {
    class: "",
    text: 'Jméno'
  },
  {
    class: "",
    text: 'Příjmení'
  },
  {
    class: "",
    text: 'Věk'
  },
  {
    class: "",
    text: 'Email'
  },
  {
    class: "",
    text: 'Telefon'
  },
  {
    class: "",
    text: 'Město'
  },
  {
    class: "",
    text: 'Hudební nástroj'
  },
  {
    class: "",
    text: 'Poprvé'
  },
  {
    class: "",
    text: 'Kdo pozval'
  },
  {
    class: "",
    text: 'Zdravotní omezení'
  },
  {
    class: "",
    text: 'Jídelní omezení'
  },
  {
    class: "",
    text: 'Poznámka'
  },
  {
    class: "",
    text: '_'
  },
  {
    class: "",
    text: 'Kategorie'
  },
  {
    class: "",
    text: 'Příjezd'
  },
  {
    class: "",
    text: 'První jídlo'
  },
  {
    class: "",
    text: 'Odjezd'
  },
  {
    class: "",
    text: 'Poslední'
  },
  {
    class: "",
    text: 'Zakoupené bonusy'
  },
  {
    class: "",
    text: 'Stav přihášky'
  },
  {
    class: "",
    text: 'Cena za noc'
  },
  {
    class: "",
    text: 'Cena'
  },
  {
    class: "",
    text: 'Interní poznámka'
  },
  {
    class: "",
    text: 'Datum přihlášení'
  },
  {
    class: "",
    text: 'Cena za bonusy'
  },
];

export class Home extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      events: [],
      selectedEventID: null,
      applications: null
    };

    ApiLayer.getEvents().then(ev => {
      this.setState({
        events: ev.data.events,
        selectedEventID: this.state.selectedEventID ?? ev.data.events.length == 1 ? ev.data.events[0].eventID : null
      });
    });
  }
  getSelectedEvent() {
    let returned = null;
    for (let event of this.state.events) {
      if (event.eventID == this.state.selectedEventID) {
        returned = event;
      }
    }
    if (this.state.selectedEventID != null && this.state.applications == null) {
      this.fetchApplications();
    }
    return returned;
  }
  async fetchApplications() {
    const resp = await ApiLayer.getApplicationsTable(this.state.selectedEventID!);
    this.setState({
      applications: resp.data.applications
    })
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
        <Table data={this.state.applications ?? []} fields={fields} />
      </>
    )
  }
}
