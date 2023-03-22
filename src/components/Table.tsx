import classNames from 'classnames';
import { MutableRef, useEffect, useRef, useState } from 'preact/hooks';
import { Fragment, JSX } from 'preact/jsx-runtime';
import '../styles/table.scss'
import { TableAction, TableRow } from './TableRow';
import stringToColor from '../plugins/stringToColor';
import localforage from 'localforage';

const FILTERS_STORAGE_KEY = 'filters';

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
    const [appliedFilters, setAppliedFiltersInternal] = useState<Filter[]>([]);
    // For focusing newly created filter:
    const [newFilter, setNewFilter] = useState<number | null>(null);
    const newFilterInput: MutableRef<HTMLInputElement | undefined> = useRef();

    function setAppliedFilters(filters: Filter[]) {
        setAllChecked(false);// When a filter changes, everything must be unselected
        setAppliedFiltersInternal(filters);
    }

    function updateFilter(filter: Filter, filterPos: number) {
        const newFilters = [
            ...appliedFilters.slice(0, filterPos),
            filter//Change only this filter value
            ,//Whole array will be updated but c'est la vie
            ...appliedFilters.slice(filterPos + 1)
        ];
        setAppliedFilters(newFilters);
        localforage.setItem(FILTERS_STORAGE_KEY, newFilters);
    }

    // On component created
    useEffect(() => {
        localforage.getItem(FILTERS_STORAGE_KEY, (err, value) => {
            if (value) {
                setAppliedFilters(value as Filter[]);
            }
        });
    }, []);

    // On filter created
    useEffect(() => {
        if (newFilter != null) {
            newFilterInput.current?.focus();
            setNewFilter(null);
        }
    }, [newFilter]);

    return <>
        {appliedFilters.length ?
            <div className="filters"><div className="icon"><i className="gg-filter" /></div>
                {
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
                }
            </div> : null
        }


        <table className={className}>
            <thead>
                <tr>
                    {showIndexColumn || showActions ?
                        <th className="index"><TableRow
                            checkbox={true}
                            checked={allChecked}
                            onChange={e => (setAllChecked(e.currentTarget.checked), setAllCheckPressed(true))}
                            afterText="Select"
                            actions={actions}
                        />
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
                                onUncheck={() => setAllChecked(false)}
                                afterText={(index + 1).toString()}
                            />);
                            if (allCheckPressed) {
                                checkRef.current?.setChecked(allChecked);
                                setAllCheckPressed(false);
                            }
                        }
                        else if (showIndexColumn) {
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