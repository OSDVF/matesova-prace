import register from 'preact-custom-element';
import linkState from 'linkstate';
import { Component } from 'preact'
import { useContext } from "preact/hooks";

import ApiLayer from '../api/api'
import { receivedData } from 'renette-api/dist/types';
import { Table } from '../components/Table';
import { fields } from './home.types';

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import '../plugins/polyfills.js'
import '../styles/home.scss'
import { Legend } from '../components/Legend';
import classNames from 'classnames';
import { AppStateContext } from '../plugins/state';
import { SubfolderRouter } from '../components/SubFolderRouter';
import { ApplicationState } from '../api/api.types';

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

type Props = {};
type State = {
  errorMessage: string | null,
  truncateCells: boolean
};

export class Home extends Component<Props, State> {
  private subscribed = false;
  constructor(props: Props) {
    super(props);

    this.state = {
      errorMessage: null,
      truncateCells: true
    };
  }
  makeErrorMessage(response: receivedData<any>): string {
    Sentry.captureEvent({
      extra: response
    });
    return `Error (code ${response.code}) while performing ${response.action}: ${JSON.stringify(response.data)}`;
  }
  render(props: Props, state: Readonly<State>) {
    const globalState = useContext(AppStateContext);
    if (!this.subscribed) {
      this.subscribed = true;
      globalState.onChange = () => this.setState({});
    }

    return <>
      <Legend
        events={globalState.events}
        onSelectEvent={e => {
          globalState.selectedEventID = parseInt(e.currentTarget.value);
          globalState.onChange();
        }}
        onChangeIncludePast={e => {
          globalState.includePastEvents = e.currentTarget.checked;
          globalState.init();
        }}
        selectedEventID={globalState.selectedEventID}
        loginHandler={SubfolderRouter.handler}
        includePast={globalState.includePastEvents}
      />
      <div className="legend">
        <strong>Statistics</strong>
        <label className="info">People count: <span>{globalState.applications?.length}</span></label>
        <label className="info">Cancelled: <span>{globalState.applications?.filter(a => a.state == ApplicationState.cancelled).length}</span></label>
        <label className="info">Emails sent: <span>{globalState.applications?.filter(a => a.confirmation_sent).length}</span>
          {
            !globalState.applications?.every(a => a.confirmation_sent) &&
            <>&ensp;<button title="Re-send emails where not sent" onClick={() => {
              globalState.resendMailIfNotSent();
            }}>💌</button></>
          }</label>
        <label className="info">Wrap text: <input type="checkbox" checked={!state.truncateCells} onChange={() => this.setState({ truncateCells: !state.truncateCells })} /></label>
      </div>
      {globalState.applications !== null &&
        <Table
          className={
            classNames({
              truncate: state.truncateCells
            })
          }
          data={globalState.applications}
          fields={fields}
          showIndexColumn={true}
          checkboxes={true}
          filters={true}
          defaultActions={[
            {
              text: "Re-send confirmation email",
              onClick: function () {
                if (Array.isArray(this)) {
                  // Multiple lines were selected
                  for (let row of this) {
                    ApiLayer.resendEmail(row.appID);
                  }
                }
                else if (this) {
                  ApiLayer.resendEmail(this.appID);
                }
                else {
                  console.log("No line was selected");
                }
              }
            }
          ]} />}
    </>
  }
}

register(Home, 'x-matesova-prace', ['eventID'], { shadow: true });