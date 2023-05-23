import { JSXInternal } from 'preact/src/jsx';
import { futureEvent } from '../api/api.types';
import Routes from '../plugins/routes';

type Props = {
    onSelectEvent: JSXInternal.GenericEventHandler<HTMLSelectElement>
    events: futureEvent[],
    selectedEventID: number | null
    loginHandler: JSXInternal.Element,
}

function toLocalDate(dateString: string | undefined) {
    if (!dateString) {
        return '';
    }
    return (new Date(dateString).toLocaleString());
}

export function Legend({ onSelectEvent, events, selectedEventID, loginHandler }: Props) {

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
        <label className="info">Applications from: <span>{toLocalDate(getSelectedEvent()?.appBegin)}</span></label>
        <label className="info">To: <span>{toLocalDate(getSelectedEvent()?.appEnd)}</span></label>
        <label className="info"><button onClick={() => Routes.go(Routes.Teams)}>Generate teams</button></label>
        <label className="info"><button onClick={() => Routes.go(Routes.Accommodation)}>Generate accommodation list</button></label>
        {loginHandler}
    </div>


}