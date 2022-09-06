import React, { Component } from "react";
import CryptoJS from "crypto-js";
import { Link } from "react-router-dom";


import Email from "./components/Email";
import PasswordOne from "./components/PasswordOne";
import PasswordTwo from "./components/PasswordTwo";
import Code from "./components/Code";

import style from "./css/Authentication.module.css";

const host_name = "https://" + document.location.host;

class Recovery extends Component
{
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            email_label: "Электронная почта",
            email_style: "input_current",

            code: "",
            code_correct: "",
            code_label: "Введите код высланный вам на почту",
            code_style: "input_current",

            password_one: "",
            password_one_label: "Пароль",
            password_one_style: "input_current",

            password_two: "",
            password_two_label: "Пароль (еще раз)",
            password_two_style: "input_current",

            email_correct: false,
            code_flag: false
        };
    }

    onChangeCode = event => this.setState({ code: event.target.value });
    UpdateCodeLabel = value => this.setState({ code_label: value });
    UpdateCodeStyle = value => this.setState({ code_style: value });

    onChangeEmail = event => this.setState({ email: event.target.value });
    UpdateEmailLabel = value => this.setState({ email_label: value });
    UpdateEmailStyle = value => this.setState({ email_style: value });

    onChangePasswordOne = event => this.setState({ password_one: event.target.value });
    UpdatePasswordOneLabel = value => this.setState({ password_one_label: value });
    UpdatePasswordOneStyle = value => this.setState({ password_one_style: value });

    onChangePasswordTwo = event => this.setState({ password_two: event.target.value });
    UpdatePasswordTwoLabel = value => this.setState({ password_two_label: value });
    UpdatePasswordTwoStyle = value => this.setState({ password_two_style: value });

    onClickBackCodeButton = () => this.setState({ email_correct: false });
    onClickBackPasswordButton = () => this.setState({ code_flag: false });

    onClickForwardEmailButton = async () => {
        if (this.state.email.length === 0) {
            return this.setState({
                email_label: "Пустое поле!",
                email_style: "input_error"
            });
        }
        if (this.state.email_style === "input_error") {
            return;
        }
        const response = await fetch(`${host_name}/api/user/check/email`, {
            method: "POST",
            headers: { "Content-Type": "application/json;charset=utf-8" },
            body: JSON.stringify({ email: this.state.email })
        });
        if (response.ok) {
            const result = await response.json();
            this.setState({
                email_correct: true,
                code_correct: result.value
            });
        }
        else {
            this.setState({
                email_label: "Неверно введенная электроная почта!",
                email_style: "input_error"
            });
        }
    }

    onClickForwardCodeButton = () => {
        if (this.state.code.length === 0) {
            return this.setState({
                code_label: "Пустое поле!",
                code_style: "input_error"
            });
        }
        if (this.state.code !== this.state.code_correct) {
            this.setState({
                code_label: "Неверно введенный код!",
                code_style: "input_error"
            });
        }
        else {
            this.setState({ code_flag: true });
        }

    }

    onClickForwardPasswordButton = async () => {
        let flag = false;
        if (this.state.password_one.length === 0) {
            this.setState({
                password_one_label: "Пустое поле!",
                password_one_style: "input_error"
            });
            flag = true;
        }
        if (this.state.password_two.length === 0) {
            this.setState({
                password_two_label: "Пустое поле!",
                password_two_style: "input_error"
            });
            flag = true;
        }
        if (flag || this.state.password_one_error || this.state.password_two_error) {
            return;
        }
        const password = CryptoJS.SHA256(this.state.password);
        const recovery = {
            email: this.state.email,
            password: password.toString()
        };
        const response = await fetch(`${host_name}/api/user/recovery`, {
            method: "PUT",
            headers: { "Content-Type": "application/json;charset=utf-8" },
            body: JSON.stringify(recovery)
        });
        if (response.ok) {
            const result = await response.json();
            localStorage.setItem("user", result.value.token);
            this.props.UpdateTimeEndToken(result.value.date);
        }
    }

    render() {
        if (this.state.code_flag) {
            return (
                <div className={style.background}>
                    <div className={[style.form, style.form_size_4].join(' ')}>
                        <p className={style.text}>
                            Восстановление аккаунта
                        </p>
                        <PasswordOne password_one={this.state.password_one} onChangePasswordOne={this.onChangePasswordOne}
                            label={this.state.password_one_label} UpdatePasswordOneLabel={this.UpdatePasswordOneLabel}
                            style={this.state.password_one_style} UpdatePasswordOneStyle={this.UpdatePasswordOneStyle} />
                        <PasswordTwo password_one={this.state.password_one}
                            password_two={this.state.password_two} onChangePasswordTwo={this.onChangePasswordTwo}
                            label={this.state.password_two_label} UpdatePasswordTwoLabel={this.UpdatePasswordTwoLabel}
                            style={this.state.password_two_style} UpdatePasswordTwoStyle={this.UpdatePasswordTwoStyle} />
                        <br />
                        <button onClick={this.onClickBackPasswordButton}>Назад</button>
                        <br />
                        <button onClick={this.onClickForwardPasswordButton}>Готово</button>
                    </div>
                </div>
            );
        }
        if (this.state.email_correct) {
            return (
                <div className={style.background}>
                    <div className={[style.form, style.form_size_1].join(' ')}>
                        <p className={style.text}>
                            Восстановление аккаунта
                        </p>
                        <Code code={this.state.code} onChangeCode={this.onChangeCode}
                            label={this.state.code_label} UpdateCodeLabel={this.UpdateCodeLabel}
                            style={this.state.code_style} UpdateCodeStyle={this.UpdateCodeStyle} />
                        <br />
                        <button onClick={this.onClickBackCodeButton}>Назад</button>
                        <br />
                        <button onClick={this.onClickForwardCodeButton}>Далее</button>
                    </div>
                </div>
            );
        }

        return (
            <div className={style.background}>
                <div className={[style.form, style.form_size_3].join(' ')}>
                    <p className={style.text}>
                        Восстановление аккаунта
                    </p>
                    <Email email={this.state.email} onChangeEmail={this.onChangeEmail}
                        label={this.state.email_label} UpdateEmailLabel={this.UpdateEmailLabel}
                        style={this.state.email_style} UpdateEmailStyle={this.UpdateEmailStyle} />
                    <br />
                    <button onClick={this.onClickForwardEmailButton}>Далее</button>
                    <Link to="/login">
                        <button>
                            Назад
                        </button>
                    </Link>
                </div>
            </div>
        );
    }
}

export default Recovery;
