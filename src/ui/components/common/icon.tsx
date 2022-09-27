import { Icons, path as icon_path } from "lantern-icons";
import { createEffect, createMemo, createResource, JSX, untrack } from "solid-js";

import "./icon.scss";

interface IGeneralVectorIconProps {
    absolute?: boolean,
    extra?: any,
}

interface IStaticVectorIconProps {
    src: string,
}

interface IRefVectorIconProps {
    id: Icons,
}

interface IAsyncVectorIconProps {
    import: () => Promise<{ default: string }>,
}

type IVectorIconProps = (IStaticVectorIconProps | IAsyncVectorIconProps | IRefVectorIconProps) & IGeneralVectorIconProps;

function select_comp(props: IVectorIconProps) {
    if((props as IRefVectorIconProps).id) return IdVectorIcon;
    if((props as IStaticVectorIconProps).src) return InlineVectorIcon;
    if((props as IAsyncVectorIconProps).import) return ImportedVectorIcon;
    return;
}

// Similar workings to `<Dynamic>` but simpler for faster rendering
export function VectorIcon(props: IVectorIconProps): JSX.Element {
    return () => {
        let comp = select_comp(props);
        if(comp) {
            return untrack(() => comp!(props as any));
        }
        return;
    };
}

const ICON_PATH = icon_path + '#';

function IdVectorIcon(props: IRefVectorIconProps & IGeneralVectorIconProps) {
    return (
        <div class="ln-icon" {...props.extra}>
            <span class="ln-icon__wrapper" style={props.absolute ? { position: 'absolute' } : void 0}>
                <svg><use href={ICON_PATH + props.id} /></svg>
            </span>
        </div>
    )
}

function InlineVectorIcon(props: IStaticVectorIconProps & IGeneralVectorIconProps) {
    return (
        <div class="ln-icon" {...props.extra}>
            <span class="ln-icon__wrapper" innerHTML={props.src} style={props.absolute ? { position: 'absolute' } : void 0} />
        </div>
    );
}

function ImportedVectorIcon(props: IAsyncVectorIconProps & IGeneralVectorIconProps) {
    let [data, { refetch }] = createResource(() => (props as IAsyncVectorIconProps).import().then(d => d.default));

    // setup effect to refresh
    createEffect(() => {
        (props as any).import;
        refetch();
    });

    return <InlineVectorIcon {...props} src={data()!} />
}