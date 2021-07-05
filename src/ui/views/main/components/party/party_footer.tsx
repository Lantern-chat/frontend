import React from "react";
import { Link } from "ui/components/history";

import "./party_footer.scss";
export const PartyFooter = React.memo(() => {
    return (
        <footer className="ln-party-footer">
            Footer

            <Link href="/profile">Gear</Link>
        </footer>
    );
})