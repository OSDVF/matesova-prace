import { JSXInternal } from 'preact/src/jsx';
import { futureEvent } from '../api/api.types';
import Routes from '../plugins/routes';

type Props = {
    onSelectEvent: JSXInternal.GenericEventHandler<HTMLSelectElement>,
    onChangeIncludePast: JSXInternal.GenericEventHandler<HTMLInputElement>,
    onGenerateCSV: () => void,
    events: futureEvent[],
    selectedEventID: number | null,
    loginHandler: JSXInternal.Element,
    includePast: boolean
}

function toLocalDate(dateString: string | undefined) {
    if (!dateString) {
        return '';
    }
    return (new Date(dateString).toLocaleString());
}

export function Legend({ onSelectEvent, events, selectedEventID, loginHandler, includePast, onChangeIncludePast, onGenerateCSV }: Props) {

    function getSelectedEvent() {
        let returned = null;
        for (let event of events) {
            if (event.eventID == selectedEventID) {
                returned = event;
            }
        }
        return returned;
    }
    console.log(events);

    return <div className="legend">
        <label>
            Selected event:&ensp;
            <select onChange={onSelectEvent}>
                {events.map(event => {
                    return <option value={event.eventID}>{event.title}</option>
                })}
            </select>
        </label>
        <label className="info">Include past&ensp;<input type="checkbox" checked={includePast} onChange={onChangeIncludePast} /></label>
        <label className="info">Applications from: <span>{toLocalDate(getSelectedEvent()?.appBegin)}</span></label>
        <label className="info">To: <span>{toLocalDate(getSelectedEvent()?.appEnd)}</span></label>
        <label className="info"><button onClick={() => Routes.go(Routes.Teams)}>Generate teams</button></label>
        <label className="info"><button onClick={() => Routes.go(Routes.Accommodation)}>Generate accommodation list</button></label>
        <label className="info"><button onClick={onGenerateCSV}>Generate CSV</button></label>
        {loginHandler}
    </div>


}