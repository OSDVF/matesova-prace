import { Component, ComponentChild, createRef, RefObject } from "preact";
import { createPortal } from "preact/compat";
import { JSXInternal } from "preact/src/jsx";
import { Menu } from "./Menu";

type Props<T> = {
    checkbox?: boolean,
    checked?: boolean,
    actions?: TableAction<T>[],
    onUncheck?: () => void,
    onChange?: JSXInternal.GenericEventHandler<HTMLInputElement>,
    afterText?: string,
    context: T | T[] | null
};

type State = {
    checked: boolean,
    toggleState: boolean,
    lastClick: {
        left: number,
        top: number
    },
    thisComponent: RefObject<HTMLDivElement>
};

export type TableAction<T> = {
    onClick: (selected: T | T[] | null, e: JSXInternal.TargetedMouseEvent<HTMLLIElement>) => void,
    text: string,
    icon?: string
};

export class TableRow<T extends any> extends Component<Props<T>, State> {
    constructor(props?: Props<T>) {
        super(props);
        this.state = {
            checked: props?.checked ?? false,
            toggleState: false,
            lastClick: {
                left: 0,
                top: 0
            },
            thisComponent: createRef()
        }
    }

    setChecked(checked: boolean) {
        this.setState({
            checked: checked
        });
    }

    closePotentialContextMenu(event: MouseEvent) {
        if (event.target && !this.state.thisComponent.current?.contains(event.currentTarget as Node)) {
            this.setState({
                toggleState: false
            })
        }
    }

    render(props: Props<T>, state: Readonly<State>): ComponentChild {
        if (state.toggleState) {
            document.body.addEventListener('click', e => this.closePotentialContextMenu(e), true);
        }

        const showActions = (props.actions ?? false);

        const indexColContent: preact.JSX.Element[] = [];
        if (showActions) {
            indexColContent.push(<input type="checkbox" checked={state.checked} onChange={e => {
                const newState = e.currentTarget.checked;
                this.setState({
                    checked: newState
                })
                if (!newState && props.onUncheck != null) {
                    props.onUncheck();
                }
                if (props.onChange) {
                    props.onChange(e);
                }
            }} />);
        }
        const actionMenuToggle = (e: any) => {
            if (e.target == e.currentTarget) {
                this.setState({
                    toggleState: !state.toggleState,
                    lastClick: {
                        left: e.pageX,
                        top: e.pageY
                    }
                });
                e.preventDefault();
                return false;
            }
            return true;
        };
        return <div ref={state.thisComponent} onClick={actionMenuToggle} onContextMenu={actionMenuToggle}>
            {indexColContent}
            {props.afterText}
            {
                state.toggleState ? createPortal(
                    <Menu {...state.lastClick} items={
                        props.actions?.map(val => ({
                            onClick: e => val.onClick(props.context, e),
                            text: val.text
                        }))
                    } />, document.body
                ) : null
            }
        </div>;
    }
}