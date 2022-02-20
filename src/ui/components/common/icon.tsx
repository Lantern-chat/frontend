import React, { useState, useEffect, CSSProperties } from "react";

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

export const VectorIcon: React.FunctionComponent<IVectorIconProps> = React.memo((props: IVectorIconProps) => {
    let style: CSSProperties | undefined, [data, setData] = useState<string>("");

    useEffect(() => {
        let static_props = props as IStaticVectorIconProps;
        if(static_props.src !== undefined) {
            return setData(static_props.src);
        }
        let async_props = props as IAsyncVectorIconProps;
        async_props.import().then(data => setData(data.default));
    }, [props]);

    if(props.absolute) {
        style = { position: 'absolute' };
    }

    return (
        <div className="ln-icon" {...props.extra}>
            <span className="ln-icon__wrapper" dangerouslySetInnerHTML={{ __html: data }} style={style} />
        </div>
    );
});

if(__DEV__) {
    VectorIcon.displayName = "VectorIcon";
}