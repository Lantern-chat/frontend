import React, { useState, useEffect } from "react";

import "./glyphicon.scss";

interface IGeneralGlyphiconProps {
    absolute?: boolean,
}

interface IStaticGlyphiconProps {
    src: string,
}

interface IAsyncGlyphiconProps {
    import: () => Promise<{ default: string }>,
}

type IGlyphiconProps = (IStaticGlyphiconProps | IAsyncGlyphiconProps) & IGeneralGlyphiconProps;

export const Glyphicon: React.FunctionComponent<IGlyphiconProps> = React.memo((props: IGlyphiconProps) => {
    let [data, setData] = useState<string>("");

    useEffect(() => {
        let static_props = props as IStaticGlyphiconProps;
        if(static_props.src !== undefined) {
            return setData(static_props.src);
        }
        let async_props = props as IAsyncGlyphiconProps;
        async_props.import().then(data => setData(data.default));
    }, [props]);

    return (
        <div className="ln-glyphicon">
            <span className="ln-glyphicon__wrapper" dangerouslySetInnerHTML={{ __html: data }} style={{ position: props.absolute != null ? 'absolute' : undefined }} />
        </div>
    );
});

if(__DEV__) {
    Glyphicon.displayName = "Glyphicon";
}