import React, { Component } from "react";
import { Link } from "react-router-dom";
import CryptoJS from "crypto-js";
import { withRouter } from "react-router";

import Email from "./components/Email";
import Password from "./components/Password";

import style from "./css/Authentication.module.css";

const host_name = "https://" + document.location.host;

class Login extends Component
{
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            email_label: "Электронная почта",
            email_style: "input_current",

            password: "",
            password_label: "Пароль",
            password_style: "input_current"
        };
    }

    onChangeEmail = event => this.setState({ email: event.target.value });
    UpdateEmailLabel = value => this.setState({ email_label: value });
    UpdateEmailStyle = value => this.setState({ email_style: value });

    onChangePassword = event => this.setState({ password: event.target.value });
    UpdatePasswordLabel = value => this.setState({ password_label: value });
    UpdatePasswordStyle = value => this.setState({ password_style: value });

    onLoginButtonClick = async () => {
        let flag = false;
        if (this.state.email.length === 0) {
            this.setState({
                email_label: "Пустое поле!",
                email_style: "input_error",
            });
            flag = true;
        }
        if (this.state.password.length === 0) {
            this.setState({
                password_label: "Пустое поле!",
                password_style: "input_error"
            });
            flag = true;
        }
        if (flag || this.state.email_style === "input_error" || this.state.password_style === "input_error") {
            return;
        }
        let password = CryptoJS.SHA256(this.state.password);
        const login = {
            email: this.state.email,
            password: password.toString()
        };
        const response = await fetch(`${host_name}/api/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json;charset=utf-8" },
            body: JSON.stringify(login)
        });
        if (response.ok) {
            const result = await response.json();
            localStorage.setItem("user", result.value.token);
            this.props.UpdateTimeEndToken(result.value.date);
        }
        else {
            this.setState({
                email_label: "Неверно введенная электронная почта!",
                email_style: "input_error",

                password_label: "Неверно введенный пароль!",
                password_style: "input_error"
            });
        }
    }


    render()
    {
        return (
            <div className={style.background}>
                <div className={[style.form, style.form_size_1].join(' ')}>
                    <p className={style.text}>
                        Вход
                    </p>
                    <Email email={this.state.email} onChangeEmail={this.onChangeEmail}
                        label={this.state.email_label} UpdateEmailLabel={this.UpdateEmailLabel}
                        style={this.state.email_style} UpdateEmailStyle={this.UpdateEmailStyle} />
                    <Password password={this.state.password} onChangePassword={this.onChangePassword}
                        label={this.state.password_label} UpdatePasswordLabel={this.UpdatePasswordLabel}
                        style={this.state.password_style} UpdatePasswordStyle={this.UpdatePasswordStyle} />
                    <div className={style.link}>
                        <Link to="/recovery">Забыли пароль?</Link>
                    </div>
                    <br />
                    <button onClick={this.onLoginButtonClick}>
                        Вход
                    </button>
                    <Link to="/registration">
                        <button>
                            Регистрация
                        </button>
                    </Link>
                </div>
            </div>
        );
    }
}

export default withRouter(Login);
