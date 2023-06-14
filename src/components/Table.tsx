import classNames from 'classnames';
import { MutableRef, useEffect, useRef, useState } from 'preact/hooks';
import { Fragment, JSX } from 'preact/jsx-runtime';
import '../styles/table.scss'
import { TableAction, TableRow } from './TableRow';
import stringToColor from '../plugins/stringToColor';
import localforage from 'localforage';
import { Component, RefObject, createRef } from 'preact';

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

type State = {
    showActions: boolean,
    allChecked: boolean,
    allCheckPressed: boolean,
    appliedFilters: Filter[],
    newFilter: number | null,
    newFilterInput: RefObject<HTMLInputElement>,
    syncHeaders: RefObject<HTMLElement>,
    tableBody: RefObject<HTMLTableSectionElement>,
    resizeObserver: ResizeObserver
};



export class Table<RowType extends (RowWithAction<RowType> | any)> extends Component<Props<RowType>, State> {
    constructor(props: Props<RowType>) {
        super(props);
        this.state = {
            showActions: typeof props.defaultActions != 'undefined' ?? false,
            allChecked: false,
            allCheckPressed: false,
            appliedFilters: [],
            newFilter: null,
            newFilterInput: createRef<HTMLInputElement>(),
            syncHeaders: createRef<HTMLElement>(),
            tableBody: createRef<HTMLTableSectionElement>(),
            resizeObserver: new ResizeObserver(() => this.doSyncHeaders())
        };
    }

    // Sync headers width
    doSyncHeaders() {
        for (let i = 0; i < (this.state.syncHeaders.current?.children?.length ?? 0); i++) {
            const headerElem = this.state.syncHeaders.current?.children[i] as HTMLElement;
            const cellElem = this.state.tableBody.current?.children[0]?.children[i]?.firstElementChild as HTMLElement;
            if (typeof cellElem === 'undefined') {
                return;
            }
            cellElem?.style.removeProperty('width');
            if ((cellElem?.clientWidth ?? 0) > 2) {
                headerElem.style.width = (cellElem.parentElement!.offsetWidth - parseFloat(getComputedStyle(headerElem.parentElement!).borderWidth.replace('px', '')) * 2) + 'px';
            }
            else {
                headerElem.style.removeProperty('width');
                cellElem.style.width = (headerElem?.clientWidth - parseFloat(getComputedStyle(cellElem.parentElement!).borderWidth.replace('px', '')) * 2) + 'px';
            }
        }
    }

    setAppliedFilters(filters: Filter[]) {
        this.setState({ allChecked: false });// When a filter changes, everything must be unselected
        this.setState({ appliedFilters: filters });
        localforage.setItem(FILTERS_STORAGE_KEY, filters);
    }

    updateFilter(filter: Filter, filterPos: number) {
        const newFilters = [
            ...this.state.appliedFilters.slice(0, filterPos),
            filter//Change only this filter value
            ,//Whole array will be updated but c'est la vie
            ...this.state.appliedFilters.slice(filterPos + 1)
        ];
        this.setState({ appliedFilters: newFilters });
    }

    render({
        data,
        fields,
        showIndexColumn = false,
        className,
        checkboxes = false,
        defaultActions = [],
        filters = false
    }: Props<RowType>, {
        showActions,
        allChecked,
        allCheckPressed,
        appliedFilters,
        newFilter,
        newFilterInput,
        syncHeaders,
        tableBody,
        resizeObserver
    }: State) {

        // After component render
        useEffect(() => {
            localforage.getItem(FILTERS_STORAGE_KEY, (_, value) => {
                if (value) {
                    this.setAppliedFilters(value as Filter[]);
                }
            });
        }, []);

        // On filter created
        useEffect(() => {
            if (newFilter != null) {
                newFilterInput.current?.focus();
                this.setState({ newFilter: null });
            }
        }, [newFilter]);
        //On table body bound 
        useEffect(() => {
            if (tableBody.current) {
                resizeObserver.disconnect();
                resizeObserver.observe(tableBody.current);
            }
        }, [tableBody]);

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
            {//Render filter badges
                appliedFilters.length ?
                    <div className="filters"><div className="icon"><i className="gg-filter" /></div>
                        {
                            appliedFilters.map((filter, filterPos) => {
                                const fieldText = fields[filter.index].text;

                                return <div className={classNames({
                                    filter: true,
                                    applied: filter.applied
                                })} style={{ background: (filter.applied ? stringToColor(fieldText) : '#cccccc') + '77' }} onClick={e => {
                                    if (e.target == e.currentTarget) {
                                        this.updateFilter({ ...filter, applied: !filter.applied }, filterPos)
                                    }
                                }}>
                                    {fieldText}:&nbsp;
                                    <input type="text" ref={filter.index == newFilter ? newFilterInput : null} value={filter.value} onInput={e => this.updateFilter({
                                        index: filter.index,
                                        applied: true,
                                        value: e.currentTarget.value
                                    }, filterPos)} />

                                    <button class="close" onClick={() => {
                                        const newFilters = [...appliedFilters];
                                        newFilters.splice(filterPos);
                                        this.setAppliedFilters(
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
                        onChange={e => (this.setState({ allChecked: e.currentTarget.checked, allCheckPressed: true }))}
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
                    let colHasAppliedFilter = false;
                    if (filters) {
                        colHasAppliedFilter = appliedFilters.find(f => f.index == fieldIndex)?.applied ?? false;
                        headerContent.push(<button
                            className={
                                classNames({
                                    filterBtn: true, applied: colHasAppliedFilter
                                })}
                            onClick={_ => {
                                this.setAppliedFilters([...appliedFilters, { index: fieldIndex, applied: true, value: "" }]);
                                this.setState({ newFilter: fieldIndex });
                            }
                            }>
                            <i className="gg-filter" /></button>
                        );
                    }

                    return (
                        <div class={classNames({
                            [field.class ?? '']: true, th: true, applied: colHasAppliedFilter
                        })}
                            title={field.text + (colHasAppliedFilter ? ' has filter applied' : '')}>
                            {headerContent}
                        </div>
                    );
                })}
            </header >
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
                                        onUncheck={() => this.setState({ allChecked: false })}
                                        afterText={(index + 1).toString()}
                                    />);
                                    if (allCheckPressed) {
                                        checkRef.current?.setChecked(allChecked);
                                        this.setState({ allCheckPressed: false });
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
                                        const content = row[field.propName as keyof RowType] as RowType;
                                        items.push(<td tabIndex={0}><div>{content instanceof Date ? content.toLocaleDateString() : (content ?? "").toString()}</div></td>);
                                    }
                                }
                                return <tr>{items}</tr>;
                            })}
                    </tbody>
                </table>
            </div></>
    }
}