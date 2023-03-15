import { JSXInternal } from 'preact/src/jsx';
import { futureEvent } from '../api/api.types';

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

    return <div className="legend">
        <label>
            Selected event:
            <select onChange={onSelectEvent}>
                {events.map(event => {
                    return <option value={event.eventID}>{event.title}</option>
                })}
            </select>
        </label>
        <label className="info">Applications from: <span>{toLocalDate(getSelectedEvent()?.appBegin)}</span></label>
        <label className="info">To: <span>{toLocalDate(getSelectedEvent()?.appEnd)}</span></label>
        {loginHandler}
    </div>


}