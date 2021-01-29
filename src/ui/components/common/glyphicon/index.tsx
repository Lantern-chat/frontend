import React, { useState, useEffect } from "react";

import "./glyphicon.scss";

interface IStaticGlyphiconProps {
    src: string,
}

interface IAsyncGlyphiconProps {
    import: () => Promise<{ default: string }>,
}

type IGlyphiconProps = IStaticGlyphiconProps | IAsyncGlyphiconProps;

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
        <span className="ln-glyphicon-wrapper">
            <span className="ln-glyphicon" dangerouslySetInnerHTML={{ __html: data }} />
        </span>
    );
});

if(process.env.NODE_ENV !== 'production') {
    Glyphicon.displayName = "Glyphicon";
}