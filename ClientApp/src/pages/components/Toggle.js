import React from "react";

import style from "../css/Toggle.module.css";

function Toggle(props) {
    const onClickButton1 = () => props.UpdateToggle(true);
    const onClickButton2 = () => props.UpdateToggle(false);
    const class_button_1 = props.toggle ? [style.button_1, style.button_select].join(' ') : style.button_1;
    const class_button_2 = props.toggle ? style.button_2 : [style.button_2, style.button_select].join(' ');
    
    return (
        <div className={style.div}>
            <button className={class_button_1}
                onClick={onClickButton1}>
                {props.name_page_1}
            </button>
            <button className={class_button_2}
                onClick={onClickButton2}>
                {props.name_page_2}
            </button>
        </div>
    );
}

export default Toggle;
