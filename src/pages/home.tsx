import register from 'preact-custom-element';
import { Component } from 'preact'
import { useContext } from "preact/hooks";

import ApiLayer from '../api/api'
import { receivedData } from 'renette-api/dist/types';
import { Table } from '../components/Table';
import { fields } from './home.types';

import * as Sentry from '@sentry/react';
import '../plugins/polyfills.js'
import '../styles/home.scss'
import { Legend } from '../components/Legend';
import classNames from 'classnames';
import { AppStateContext } from '../plugins/state';
import { SubfolderRouter } from '../components/SubFolderRouter';
import { ApplicationState, Meal, application } from '../api/api.types';
import _ from 'lodash'

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
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

type MealCount = { all: number, vege: number, free: number };
type MealCounts = { [meal in Meal]: MealCount };

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
    const days = getStatistics(globalState.applications);
    const order = { [Meal.SNIDANE]: 0, [Meal.OBED]: 1, [Meal.VECERE]: 2 }
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
        onGenerateCSV={async () => {
          if (globalState.applications) {
            const exportToCsv = await import('export-to-csv')
            const csvConfig = exportToCsv.mkConfig({
              filename: `applications-${new Date().toLocaleString(navigator.language)}`,
              columnHeaders: fields.map(f => f.propName),
            })

            const csvData = globalState.applications.map(a => _.mapValues(a, v => v?.toString()))

            exportToCsv.download(csvConfig)(exportToCsv.generateCsv(csvConfig)(csvData))
          }
        }}
        selectedEventID={globalState.selectedEventID}
        loginHandler={SubfolderRouter.handler}
        includePast={globalState.includePastEvents}
      />
      <div className="legend">
        <strong>Statistics</strong>
        <label className="info">{"\u{1F9D1}\u{200D}\u{1F91D}\u{200D}\u{1F9D1}"} <span>{globalState.applications?.length}</span></label>
        {
          days.map(([date, { places, meals }]) => <label className="info">{new Date(date).getDate()}.{new Date(date).getMonth() + 1}. {places} {"\u{1F9D1}\u{200D}\u{1F4BC}"} &nbsp;
            {Object.entries(meals).sort((a, b) => {
              return order[a[0] as any as keyof typeof order] - order[b[0] as any as keyof typeof order];
            }).map(([meal, count], i, a) => count.all > 0 ? <span key={meal}>{meal[0]}: {count.all}<small>{specialMealToStr(count)}</small>{i == a.length - 1 ? '' : ', '}</span> : null)}
          </label>)
        }
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

const empty: MealCount = {
  all: 0,
  vege: 0,
  free: 0
}
function mealType(a: application): MealCount {
  return {
    all: 1,
    vege: a.note_food.includes('vege') ? 1 : 0,
    free: a.note_food.includes('bezlep') ? 1 : 0
  }
}
function specialMealToStr(count: MealCount): string {
  return count.vege || count.free ? `(${count.vege}v, ${count.free}b)` : '';
}
function addMeals(a: MealCounts, b: MealCounts): MealCounts {
  return {
    [Meal.OBED]: {
      all: a[Meal.OBED].all + b[Meal.OBED].all,
      vege: a[Meal.OBED].vege + b[Meal.OBED].vege,
      free: a[Meal.OBED].free + b[Meal.OBED].free
    },
    [Meal.SNIDANE]: {
      all: a[Meal.SNIDANE].all + b[Meal.SNIDANE].all,
      vege: a[Meal.SNIDANE].vege + b[Meal.SNIDANE].vege,
      free: a[Meal.SNIDANE].free + b[Meal.SNIDANE].free
    },
    [Meal.VECERE]: {
      all: a[Meal.VECERE].all + b[Meal.VECERE].all,
      vege: a[Meal.VECERE].vege + b[Meal.VECERE].vege,
      free: a[Meal.VECERE].free + b[Meal.VECERE].free
    }
  }

}
function getStatistics(applications: application[] | null) {
  if (!applications) return [];

  const days = new Map<number, {
    places: number,
    meals: MealCounts
  }>();
  for (const a of applications) {
    // JS will automatically uodate month and year
    const meal = mealType(a);
    for (let day = new Date(a.arrival), meals = {
      [Meal.OBED]: [Meal.OBED, Meal.SNIDANE].includes(a.first_meal) ? meal : empty,
      [Meal.SNIDANE]: a.first_meal === Meal.SNIDANE ? meal : empty,
      [Meal.VECERE]: meal,
    }; day <= a.departure; day.setDate(day.getDate() + 1), meals = day.getTime() == a.departure.getTime()/* JS compares Date by ref */ ? {
      [Meal.OBED]: [Meal.OBED, Meal.VECERE].includes(a.last_meal) ? meal : empty,
      [Meal.SNIDANE]: meal,
      [Meal.VECERE]: a.last_meal === Meal.VECERE ? meal : empty,
    } : {
      [Meal.OBED]: meal,
      [Meal.SNIDANE]: meal,
      [Meal.VECERE]: meal,
    }) {
      const current = days.get(day.getTime());
      if (typeof current === 'undefined') {
        days.set(day.getTime(), { places: 1, meals });
      } else {
        days.set(day.getTime(), {
          places: current.places + 1,
          meals: addMeals(current.meals, meals)
        });
      }
    }
  }
  //return as array sorted by date
  return Array.from(days.entries()).sort((a, b) => a[0] - b[0]);
}

const name = 'x-matesova-prace'
window?.customElements.get(name) || register(Home, name, ['eventID'], { shadow: true });