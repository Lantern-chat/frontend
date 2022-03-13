import { createEffect, createResource, JSX } from "solid-js";

import "./icon.scss";

interface IGeneralVectorIconProps {
    absolute?: boolean,
    extra?: any,
}

interface IStaticVectorIconProps {
    src: string,
}

interface IAsyncVectorIconProps {
    import: () => Promise<{ default: string }>,
}

type IVectorIconProps = (IStaticVectorIconProps | IAsyncVectorIconProps) & IGeneralVectorIconProps;

export function VectorIcon(props: IVectorIconProps) {
    let [data, { refetch }] = createResource(
        // setup resource to track static prop
        () => (props as IStaticVectorIconProps).src,
        (initial: string | undefined) => {
            // fast-path for static
            if(initial) return initial;

            // import and get default
            return (props as IAsyncVectorIconProps).import().then(d => d.default);
        });

    // if async, setup effect to refresh
    createEffect(() => {
        (props as any).import;
        refetch();
    });

    return (
        <div className="ln-icon" {...props.extra}>
            <span className="ln-icon__wrapper" innerHTML={data()} style={props.absolute ? { position: 'absolute' } : void 0} />
        </div>
    );
}