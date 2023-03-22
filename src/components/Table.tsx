import { MutableRef, useRef, useState } from 'preact/hooks';
import { Fragment } from 'preact/jsx-runtime';
import '../styles/table.scss'
import { TableAction, TableRow } from './TableRow';

export type TableField = {
    text: string;
    class: string;
};

type Props<T> = {
    fields: Array<TableField>;
    data: T[],
    showIndexColumn?: boolean,
    className: string,
    checkboxes?: boolean,
    actions?: TableAction[]
};


export function Table<T>({ data, fields, showIndexColumn = false, className, checkboxes = false, actions = [] }: Props<T>) {
    const showActions = (actions ?? false);
    const [allChecked, setAllChecked] = useState(false);
    const [allCheckPressed, setAllCheckPressed] = useState(false);

    return <table className={className}>
        <thead>
            <tr>
                {showIndexColumn || showActions ?
                    <th><input type="checkbox"
                        checked={allChecked}
                        onChange={e => (setAllChecked(e.currentTarget.checked), setAllCheckPressed(true))} />Pořadí</th> : null
                }

                {fields.map((field) => {
                    return <th class={field.class}>{field.text}</th>
                })}
            </tr>
        </thead>
        <tbody>
            {data.map((row, index) => {
                const checkRef: MutableRef<TableRow | undefined> = useRef();
                const items: preact.JSX.Element[] = [];
                let indexColContent: preact.JSX.Element[] = [];

                if (showActions) {
                    indexColContent.push(<TableRow actions={actions}
                        checkbox={checkboxes}
                        ref={checkRef}
                        onUncheck={() => setAllChecked(false)} />
                    );
                    if(allCheckPressed)
                    {
                        checkRef.current?.setChecked(allChecked);
                        setAllCheckPressed(false);
                    }
                }
                if (showIndexColumn) {
                    indexColContent.push(<Fragment>{index + 1}</Fragment>);
                }
                if (showIndexColumn || showActions) {
                    items.push(<td class="index">{indexColContent}</td>);
                }
                for (let property in row) {
                    items.push(<td tabIndex={0}><div>{row[property]!}</div></td>);
                }
                return <tr>{items}</tr>;
            })}
        </tbody>
    </table>
}