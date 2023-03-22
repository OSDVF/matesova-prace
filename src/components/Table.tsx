import classNames from 'classnames';
import { MutableRef, useEffect, useRef, useState } from 'preact/hooks';
import { Fragment, JSX } from 'preact/jsx-runtime';
import '../styles/table.scss'
import { TableAction, TableRow } from './TableRow';
import stringToColor from '../plugins/stringToColor';

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
    actions?: TableAction[],
    filters?: boolean
};

type Filter = {
    index: number,
    value: string,
    applied: boolean
};

export function Table<T>({
    data,
    fields,
    showIndexColumn = false,
    className,
    checkboxes = false,
    actions = [],
    filters = false
}: Props<T>) {

    const showActions = (actions ?? false);
    const [allChecked, setAllChecked] = useState(false);
    const [allCheckPressed, setAllCheckPressed] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState<Filter[]>([]);
    // For focusing newly created filter:
    const [newFilter, setNewFilter] = useState<number | null>(null);
    const newFilterInput: MutableRef<HTMLInputElement | undefined> = useRef();

    function updateFilter(filter: Filter, filterPos: number) {
        setAppliedFilters([
            ...appliedFilters.slice(0, filterPos),
            filter//Change only this filter value
            ,//Whole array will be updated but c'est la vie
            ...appliedFilters.slice(filterPos + 1)
        ])
    }

    useEffect(() => {
        if (newFilter != null) {
            newFilterInput.current?.focus();
            setNewFilter(null);
        }
    }, [newFilter]);

    return <>
        <div className="filters"><div className="icon"><i className="gg-filter" /></div>{
            appliedFilters.map((filter, filterPos) => {
                const fieldText = fields[filter.index].text;

                return <span className={classNames({
                    filter: true,
                    applied: filter.applied
                })} style={{ background: (filter.applied ? stringToColor(fieldText) : '#cccccc') + '77' }} onClick={e => {
                    if (e.target == e.currentTarget) {
                        updateFilter({ ...filter, applied: !filter.applied }, filterPos)
                    }
                }}>
                    {fieldText}:&nbsp;
                    <input type="text" ref={filter.index == newFilter ? newFilterInput as MutableRef<HTMLInputElement> : null} value={filter.value} onInput={e => updateFilter({
                        index: filter.index,
                        applied: true,
                        value: e.currentTarget.value
                    }, filterPos)} />

                    <button class="close" onClick={() => {
                        const newFilters = [...appliedFilters];
                        newFilters.splice(filterPos);
                        setAppliedFilters(
                            newFilters
                        );
                    }}>&times;</button>
                </span>
            })
        }</div>


        <table className={className}>
            <thead>
                <tr>
                    {showIndexColumn || showActions ?
                        <th>Pořadí<input type="checkbox"
                            checked={allChecked}
                            onChange={e => (setAllChecked(e.currentTarget.checked), setAllCheckPressed(true))} />
                        </th> : null
                    }

                    {fields.map((field, fieldIndex) => {
                        const headerContent: JSX.Element[] = [<Fragment>{field.text}</Fragment>];
                        if (filters) {
                            headerContent.push(<button
                                className={
                                    classNames({
                                        filterBtn: true, applied: appliedFilters.find(f => f.index == fieldIndex)?.applied
                                    })}
                                onClick={_ => {
                                    setAppliedFilters([...appliedFilters, { index: fieldIndex, applied: true, value: "" }]);
                                    setNewFilter(fieldIndex);
                                }}>
                                <i className="gg-filter" /></button>
                            );
                        }

                        return <th class={field.class}>{headerContent}</th>
                    })}
                </tr>
            </thead>
            <tbody>
                {data
                    .filter(row => {
                        let i = 0;
                        for (let property in row) {
                            const correspondingFilter = appliedFilters.find(f => f.index == i);
                            const filterEmpty = correspondingFilter == null || correspondingFilter.applied == false || !correspondingFilter.value;
                            if (!filterEmpty && (row[property] as string).indexOf(correspondingFilter.value) == -1) {
                                return false;
                            }
                            i++;
                        }
                        return true;
                    })
                    .map((row, index) => {
                        const checkRef: MutableRef<TableRow | undefined> = useRef();
                        const items: JSX.Element[] = [];
                        let indexColContent: JSX.Element[] = [];

                        if (showActions) {
                            indexColContent.push(<TableRow actions={actions}
                                checkbox={checkboxes}
                                ref={checkRef}
                                onUncheck={() => setAllChecked(false)} />
                            );
                            if (allCheckPressed) {
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
        </table></>
}