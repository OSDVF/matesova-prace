import classNames from 'classnames';
import { MutableRef, useEffect, useRef, useState } from 'preact/hooks';
import { Fragment, JSX } from 'preact/jsx-runtime';
import '../styles/table.scss'
import { TableAction, TableRow } from './TableRow';
import stringToColor from '../plugins/stringToColor';
import localforage from 'localforage';
import { createRef } from 'preact';

const FILTERS_STORAGE_KEY = 'filters';

export type TableField = {
    text: string;
    propName: string;
    class?: string;
    show?: boolean;
};

type Props<T> = {
    fields: Array<TableField>;
    data: T[],
    showIndexColumn?: boolean,
    className: string,
    checkboxes?: boolean,
    defaultActions?: TableAction<T>[],
    filters?: boolean
};

type Filter = {
    index: number,
    value: string,
    applied: boolean
};

type RowWithAction<T> = {
    actions: TableAction<T>[]
}

export function Table<RowType extends (RowWithAction<RowType> | any)>({
    data,
    fields,
    showIndexColumn = false,
    className,
    checkboxes = false,
    defaultActions = [],
    filters = false
}: Props<RowType>) {

    const showActions = (defaultActions ?? false);
    const [allChecked, setAllChecked] = useState(false);
    const [allCheckPressed, setAllCheckPressed] = useState(false);
    const [appliedFilters, setAppliedFiltersInternal] = useState<Filter[]>([]);
    // For focusing newly created filter:
    const [newFilter, setNewFilter] = useState<number | null>(null);
    const newFilterInput: MutableRef<HTMLInputElement | undefined> = useRef();
    const syncHeaders = createRef<HTMLElement>();
    const tableBody = createRef<HTMLTableSectionElement>();

    function setAppliedFilters(filters: Filter[]) {
        setAllChecked(false);// When a filter changes, everything must be unselected
        setAppliedFiltersInternal(filters);
        localforage.setItem(FILTERS_STORAGE_KEY, filters);
    }

    function updateFilter(filter: Filter, filterPos: number) {
        const newFilters = [
            ...appliedFilters.slice(0, filterPos),
            filter//Change only this filter value
            ,//Whole array will be updated but c'est la vie
            ...appliedFilters.slice(filterPos + 1)
        ];
        setAppliedFilters(newFilters);
    }

    // After component render
    useEffect(() => {
        localforage.getItem(FILTERS_STORAGE_KEY, (_, value) => {
            if (value) {
                setAppliedFilters(value as Filter[]);
            }
        });

        // Sync headers width
        for (let i = 0; i < (syncHeaders.current?.childElementCount ?? 0); i++) {
            const headerElem = syncHeaders.current?.children[i] as HTMLElement;
            const bodyElem = tableBody.current?.children[0].children![i];
            headerElem.style.width = bodyElem?.clientWidth + 'px';
        }
    }, []);

    // On filter created
    useEffect(() => {
        if (newFilter != null) {
            newFilterInput.current?.focus();
            setNewFilter(null);
        }
    }, [newFilter]);



    const filteredData = data
        .filter(row => {
            let i = 0;
            for (let field of fields) {
                const correspondingFilter = appliedFilters.find(f => f.index == i);
                const filterEmpty = correspondingFilter == null || correspondingFilter.applied == false || !correspondingFilter.value;
                const val = row[field.propName as keyof RowType];
                if (!filterEmpty && val && val.toString().indexOf(correspondingFilter.value) == -1) {
                    return false;
                }
                i++;
            }
            return true;
        });

    return <>
        {appliedFilters.length ?
            <div className="filters"><div className="icon"><i className="gg-filter" /></div>
                {
                    appliedFilters.map((filter, filterPos) => {
                        const fieldText = fields[filter.index].text;

                        return <div className={classNames({
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
                        </div>
                    })
                }
            </div> : null
        }

        <header ref={syncHeaders}>
            {showIndexColumn || showActions ?
                <div className="index th"><TableRow
                    context={filteredData}
                    checkbox={true}
                    checked={allChecked}
                    onChange={e => (setAllChecked(e.currentTarget.checked), setAllCheckPressed(true))}
                    afterText="Select"
                    actions={defaultActions}
                />
                </div> : null
            }

            {fields.map((field, fieldIndex) => {
                if (!(field?.show ?? true)) {
                    return null;
                }
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

                return <div class={(field.class ?? '' + ' th')}>{headerContent}</div>
            })}
        </header>
        <div class="scroll-x" onScroll={e => {
            // Sync headers and body
            if (syncHeaders.current) {
                syncHeaders.current.style.transform = `translateX(${-e.currentTarget.scrollLeft}px)`;
            }
        }}>
            <table className={className}>
                <tbody ref={tableBody}>
                    {
                        filteredData.map((row, index) => {
                            const checkRef: MutableRef<TableRow<RowType> | undefined> = useRef();
                            const items: JSX.Element[] = [];
                            let indexColContent: JSX.Element[] = [];

                            if (showActions) {
                                indexColContent.push(<TableRow actions={(row as RowWithAction<RowType>)?.actions ?? defaultActions}
                                    context={row}
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
                            for (let field of fields) {
                                if ((field.show ?? true) && Object.hasOwn(row as object, field.propName)) {
                                    items.push(<td tabIndex={0}><div>{row[field.propName as keyof RowType] as string}</div></td>);
                                }
                            }
                            return <tr>{items}</tr>;
                        })}
                </tbody>
            </table>
        </div></>
}