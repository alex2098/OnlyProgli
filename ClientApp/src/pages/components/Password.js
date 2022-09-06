import React from "react";

function Password(props) {
    const onCheckPassword = () => {
        props.UpdatePasswordLabel("Пароль");
        props.UpdatePasswordStyle("input_current");
    };

    return (
        <div>
            <span className={props.style}>{props.label}</span>
            <br />
            <input className={props.style}
                type="password"
                value={props.password}
                onChange={props.onChangePassword}
                onBlur={onCheckPassword} />
        </div>
    );
}

export default Password;