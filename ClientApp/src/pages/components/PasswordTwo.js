import React from "react";

function PasswordTwo(props) {
    const onCheckPasswordTwo = () => {
        if (props.password_one === props.password_two || props.password_two.length === 0) {
            props.UpdatePasswordTwoLabel("Пароль (еще раз)");
            props.UpdatePasswordTwoStyle("input_current");
        }
        else {
            props.UpdatePasswordTwoLabel("Пароли не совпадают!");
            props.UpdatePasswordTwoStyle("input_error");
        }
    };

    return (
        <div>
            <span className={props.style}>{props.label}</span>
            <br />
            <input className={props.style}
                type="password"
                value={props.password_two}
                onChange={props.onChangePasswordTwo}
                onBlur={onCheckPasswordTwo} />
        </div>
    );
}

export default PasswordTwo;
