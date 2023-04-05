import register from 'preact-custom-element';
import linkState from 'linkstate';
import { Component, Fragment } from 'preact'
import { useContext, useErrorBoundary } from "preact/hooks";

import ApiLayer from '../api/api'
import { receivedData } from 'renette-api/dist/types';
import { Table } from '../components/Table';
import { LoginHandler } from '../components/LoginHandler';
import { fields } from './home.types';

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import '../plugins/polyfills.js'
import '../styles/home.scss'
import { Legend } from '../components/Legend';
import { JSXInternal } from 'preact/src/jsx';
import classNames from 'classnames';
import { AppStateContext } from '../plugins/state';
import { useRouter } from 'preact-router';
import { SubfolderRouter } from '../components/SubFolderRouter';

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
  errorMessage: string | null,
  truncateCells: boolean
};

export class Home extends Component<Props, State> {
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
    globalState.onChange = () => this.setState({});

    return <>
      <Legend
        events={globalState.events}
        onSelectEvent={linkState(this, 'selectedEventID')}
        selectedEventID={globalState.selectedEventID}
        loginHandler={SubfolderRouter.handler}
      />
      <div className="legend">
        <strong>Statistics</strong><label className="info">People count: <span>{globalState.applications?.length}</span></label>
        <label className="info">Wrap text: <input type="checkbox" checked={!state.truncateCells} onChange={() => this.setState({ truncateCells: !state.truncateCells })} /></label>
      </div>
      {globalState.applications !== null && <Table
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