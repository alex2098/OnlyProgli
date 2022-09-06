import React from "react";

function PasswordOne(props) {
    const onCheckPasswordOne = () => {
        const re_symbol = /[a-zа-я]/;
        const re_big_symbol = /[A-ZА-Я]/;
        const re_number = /\d/;
        let str = "input_error";
        if (props.password_one.length === 0) {
            props.UpdatePasswordOneLabel("Пароль");
            str = "input_current";
        }
        else if (props.password_one.length < 8 || props.password_one.length > 64) {
            props.UpdatePasswordOneLabel("Пароль должен быть длиной от 8 до 64 символов!");
        }
        else if (!re_symbol.test(props.password_one)) {
            props.UpdatePasswordOneLabel("Пароль должен содержать хотя бы одну строчную букву!");
        }
        else if (!re_big_symbol.test(props.password_one)) {
            props.UpdatePasswordOneLabel("Пароль должен содержать хотя бы одну заглавную букву!");
        }
        else if (!re_number.test(props.password_one)) {
            props.UpdatePasswordOneLabel("Пароль должен содержать хотя бы одну цифру!");
        }
        else {
            props.UpdatePasswordOneLabel("Пароль");
            str = "input_current";
        }
        props.UpdatePasswordOneStyle(str);
        
    };

    return (
        <div>
            <span className={props.style}>{props.label}</span>
            <br />
            <input className={props.style}
                type="password"
                value={props.password_one}
                onChange={props.onChangePasswordOne}
                onBlur={onCheckPasswordOne} />
        </div>
    );
}

export default PasswordOne;
