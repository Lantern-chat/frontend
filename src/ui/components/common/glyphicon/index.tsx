import React, { useState, useEffect } from "react";

import "./glyphicon.scss";

interface IGlyphiconProps {
    import: () => Promise<{ default: string }>,
}

export const Glyphicon: React.FunctionComponent<IGlyphiconProps> = React.memo((props: IGlyphiconProps) => {
    let [data, setData] = useState<string>("");
    useEffect(() => { props.import().then(data => setData(data.default)); }, []);
    return (
        <span className="ln-glyphicon-wrapper">
            <span className="ln-glyphicon" dangerouslySetInnerHTML={{ __html: data }} />
        </span>
    );
});

if(process.env.NODE_ENV !== 'production') {
    Glyphicon.displayName = "Glyphicon";
}