import React from "react";

import style from "../css/NamePage.module.css";

function NamePage(props) {
    return (
        <div className={style.name_page}>
            {props.name}
        </div>
    );
}

export default NamePage;
