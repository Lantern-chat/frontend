import { createResource, JSX } from "solid-js";

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
    let [data] = createResource("", () => {
        // fast-path for static (including empty string)
        if("string" == typeof (props as IStaticVectorIconProps).src) return (props as IStaticVectorIconProps).src;

        // import and get default
        return (props as IAsyncVectorIconProps).import().then(d => d.default);
    });

    return (
        <div className="ln-icon" {...props.extra}>
            <span className="ln-icon__wrapper" innerHTML={data()} style={props.absolute ? { position: 'absolute' } : void 0} />
        </div>
    );
}