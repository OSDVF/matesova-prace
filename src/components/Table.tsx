import '../styles/table.scss'

export type TableField = {
    text: string;
    class: string;
};

type Props<T> = {
    fields: Array<TableField>;
    data: T[],
    showIndexColumn: boolean,
    className: string
};


export function Table<T>({ data, fields, showIndexColumn = false, className }: Props<T>) {
    return <table className={className}>
        <thead>
            <tr>
                {showIndexColumn ?
                    <th>Pořadí</th> : ''
                }
                
                {fields.map((field) => {
                    return <th class={field.class}>{field.text}</th>
                })}
            </tr>
        </thead>
        <tbody>
            {data.map((row, index) => {
                const items: preact.JSX.Element[] = [];
                if (showIndexColumn) {
                    items.push(<td>{index + 1}</td>);
                }
                for (let property in row) {
                    items.push(<td tabIndex={0}><div>{row[property]!}</div></td>);
                }
                return <tr>{items}</tr>;
            })}
        </tbody>
    </table>
}