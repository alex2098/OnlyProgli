import React from "react";

function Code(props) {
    const onCheckCode = () => {
        props.UpdateCodeLabel("Введите код высланный вам на почту");
        props.UpdateCodeStyle("input_current");
    };

    return (
        <div>
            <span className={props.style}>{props.label}</span>
            <br />
            <input className={props.style}
                type="text"
                value={props.code}
                onChange={props.onChangeCode}
                onBlur={onCheckCode} />
        </div>
    );
}

export default Code;
