import React, { useState, useEffect, CSSProperties } from "react";

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
    let style: CSSProperties | undefined, [data, setData] = useState<string>("");

    useEffect(() => {
        let static_props = props as IStaticGlyphiconProps;
        if(static_props.src !== undefined) {
            return setData(static_props.src);
        }
        let async_props = props as IAsyncGlyphiconProps;
        async_props.import().then(data => setData(data.default));
    }, [props]);

    if(props.absolute) {
        style = { position: 'absolute' };
    }

    return (
        <div className="ln-glyphicon">
            <span className="ln-glyphicon__wrapper" dangerouslySetInnerHTML={{ __html: data }} style={style} />
        </div>
    );
});

if(__DEV__) {
    Glyphicon.displayName = "Glyphicon";
}