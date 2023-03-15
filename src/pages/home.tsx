import register from 'preact-custom-element';
import linkState from 'linkstate';
import { Component, Fragment } from 'preact'
import { useErrorBoundary } from "preact/hooks";

import ApiLayer from '../api/api'
import { receivedData } from 'renette-api/dist/types';
import { application, futureEvent } from '../api/api.types'
import { Table } from '../components/Table';
import { LoginHandler } from '../components/LoginHandler';
import { fields } from './home.types';

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import '../plugins/polyfills.js'
import '../styles/home.scss'

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new BrowserTracing(), new Sentry.Replay()],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 0.5,
    // If the entire session is not sampled, use the below sample rate to sample
    // sessions when an error occurs.
    replaysOnErrorSampleRate: import.meta.env.PROD ? 0.8 : 1.0,
  });
}

type Props = {
  eventID: number | null
};
type State = {
  events: futureEvent[],
  selectedEventID: number | null
  applications: application[] | null,
  errorMessage: string | null,
  loggedIn: boolean
};

export class Home extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      events: [],
      selectedEventID: this.props.eventID,
      applications: null,
      errorMessage: null,
      loggedIn: false
    };

    ApiLayer.auth().catch((e) => this.showError(e));

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
    try {
      const resp = await ApiLayer.getApplicationsTable(this.state.selectedEventID!);
      if (resp.data.applications) {
        this.setState({
          applications: resp.data.applications
        })
      }
      else {
        this.setState({
          errorMessage: this.makeErrorMessage(resp)
        })
      }
    }
    catch (e) {
      this.showError(e);
    }
  }
  makeErrorMessage(response: receivedData<any>): string {
    Sentry.captureEvent({
      extra: response
    });
    return `Error (code ${response.code}) while performing ${response.action}: ${JSON.stringify(response.data)}`;
  }
  showError(e: any) {
    this.setState({
      errorMessage: `Failed to fetch data. Details: ${JSON.stringify(e)}`
    })
    Sentry.captureException(e);
  }
  toLocalDate(dateString: string | undefined) {
    if (!dateString) {
      return '';
    }
    return (new Date(dateString).toLocaleString());
  }
  render() {
    const [error, resetError] = useErrorBoundary(error => {
      Sentry.captureException(error);
    });

    if (error) {
      return (
        <Fragment>
          <h1>Error</h1>
          <p>An error occurred.</p>
          <small>Reason: {error.message}</small>
          <button onClick={resetError}>Try again</button>
        </Fragment>
      );
    }

    const handler = <LoginHandler
      allowedDomain='travna.cz'
      logInPromptText='Log in firstly using your @travna account'
      onLoggedIn={() => this.setState({ loggedIn: true })}
    />

    if (!this.state.loggedIn) {
      return <div>{handler}</div>;
    }

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
          {handler}
        </div>

        {this.state.errorMessage != null ?
          <output className="text-error">
            {this.state.errorMessage}
          </output> : ''
        }
        <Table data={this.state.applications ?? []} fields={fields} />
      </>
    )
  }
}

register(Home, 'x-matesova-prace', ['eventID'], { shadow: true });