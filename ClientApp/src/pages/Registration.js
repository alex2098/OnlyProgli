import React, { Component } from "react";
import CryptoJS from "crypto-js";

import Email from "./components/Email";
import Nickname from "./components/Nickname";
import PasswordOne from "./components/PasswordOne";
import PasswordTwo from "./components/PasswordTwo";
import Code from "./components/Code";

import style from "./css/Authentication.module.css";

const host_name = "https://" + document.location.host;

class Registration extends Component
{
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            email_label: "Электронная почта",
            email_style: "input_current",

            nickname: "",
            nickname_label: "Имя",
            nickname_style: "input_current",

            password_one: "",
            password_one_label: "Пароль",
            password_one_style: "input_current",

            password_two: "",
            password_two_label: "Пароль (еще раз)",
            password_two_style: "input_current",

            code: "",
            code_correct: "",
            code_label: "Введите код высланный вам на почту",
            code_style: "input_current",

            reg_correct: false
        };
    }

    onChangeEmail = event => this.setState({ email: event.target.value });
    UpdateEmailLabel = value => this.setState({ email_label: value });
    UpdateEmailStyle = value => this.setState({ email_style: value });

    onChangeNickname = event => this.setState({ nickname: event.target.value });
    UpdateNicknameLabel = value => this.setState({ nickname_label: value });
    UpdateNicknameStyle = value => this.setState({ nickname_style: value });

    onChangePasswordOne = event => this.setState({ password_one: event.target.value });
    UpdatePasswordOneLabel = value => this.setState({ password_one_label: value });
    UpdatePasswordOneStyle = value => this.setState({ password_one_style: value });

    onChangePasswordTwo = event => this.setState({ password_two: event.target.value });
    UpdatePasswordTwoLabel = value => this.setState({ password_two_label: value });
    UpdatePasswordTwoStyle = value => this.setState({ password_two_style: value });

    onChangeCode = event => this.setState({ code: event.target.value });
    UpdateCodeLabel = value => this.setState({ code_label: value });
    UpdateCodeStyle = value => this.setState({ code_style: value });

    onClickRegButton = async () => {
        let flag = false;
        if (this.state.email.length === 0) {
            this.setState({
                email_label: "Пустое поле!",
                email_style: "input_error"
            });
            flag = true;
        }
        if (this.state.nickname.length === 0) {
            this.setState({
                nickname_label: "Пустое поле!",
                nickname_style: "input_error"
            });
            flag = true;
        }
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
        if (flag || this.state.email_style === "input_error" || this.state.nickname_style === "input_error" ||
            this.state.password_one_style === "input_error" || this.state.password_two_style === "input_error") {
            return;
        }
        const reg = {
            email: this.state.email,
            nickname: this.state.nickname
        };
        const response = await fetch(`${host_name}/api/user/check/full`, {
            method: "POST",
            headers: { "Content-Type": "application/json;charset=utf-8" },
            body: JSON.stringify(reg)
        });
        if (response.ok) {
            const result = await response.json();
            this.setState({
                reg_correct: true,
                code_correct: result.value
            });
        }
        else {
            const result = await response.json();
            if (result.value === "email") {
                this.setState({
                    email_label: "Данная электронная почта уже существует",
                    email_style: "input_error"
                });
            }
            if (result.value === "nickname") {
                this.setState({
                    nickname_label: "Данное имя уже существует",
                    nickname_style: "input_error"
                });
            }
        }
    }

    onClickBackButton = () => this.setState({ reg_correct: false });

    onClickCodeButton = async () => {
        if (this.state.code.length === 0) {
            return this.setState({
                    code_label: "Пустое поле!",
                    code_style: "input_error"
            });
        }
        if (this.state.code === this.state.code_correct) {
            const password = CryptoJS.SHA256(this.state.password_one);
            const reg = {
                email: this.state.email,
                nickname: this.state.nickname,
                password: password.toString()
            };
            const response = await fetch(`${host_name}/api/user/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json;charset=utf-8" },
                body: JSON.stringify(reg)
            });
            if (response.ok) {
                const result = await response.json();
                localStorage.setItem("user", result.value.token);
                this.props.UpdateTimeEndToken(result.value.date);
            }
        }
        else {
            this.setState({
                code_label: "Неверно введенный код!",
                code_style: "input_error"
            });
        }
    }

    render() {
        if (this.state.reg_correct) {
            return (
                <div className={style.background}>
                    <div className={[style.form, style.form_size_1].join(' ')}>
                        <p className={style.text}>
                            Регистрация
                        </p>
                        <Code code={this.state.code} onChangeCode={this.onChangeCode}
                            label={this.state.code_label} UpdateCodeLabel={this.UpdateCodeLabel}
                            style={this.state.code_style} UpdateCodeStyle={this.UpdateCodeStyle} />
                        <br />
                        <button onClick={this.onClickBackButton}>Назад</button>
                        <br />
                        <button className={style.button_registration}
                            onClick={this.onClickCodeButton}>Зарегистрироваться</button>
                    </div>
                </div>
            );
        }
        return (
            <div className={style.background}>
                <div className={[style.form, style.form_size_2].join(' ')}>
                    <p className={style.text}>
                        Регистрация
                    </p>
                    <Email email={this.state.email} onChangeEmail={this.onChangeEmail}
                        label={this.state.email_label} UpdateEmailLabel={this.UpdateEmailLabel}
                        style={this.state.email_style} UpdateEmailStyle={this.UpdateEmailStyle} />
                    <Nickname nickname={this.state.nickname} onChangeNickname={this.onChangeNickname}
                        label={this.state.nickname_label} UpdateNicknameLabel={this.UpdateNicknameLabel}
                        style={this.state.nickname_style} UpdateNicknameStyle={this.UpdateNicknameStyle} />
                    <PasswordOne password_one={this.state.password_one} onChangePasswordOne={this.onChangePasswordOne}
                        label={this.state.password_one_label} UpdatePasswordOneLabel={this.UpdatePasswordOneLabel}
                        style={this.state.password_one_style} UpdatePasswordOneStyle={this.UpdatePasswordOneStyle} />
                    <PasswordTwo password_one={this.state.password_one}
                        password_two={this.state.password_two} onChangePasswordTwo={this.onChangePasswordTwo}
                        label={this.state.password_two_label} UpdatePasswordTwoLabel={this.UpdatePasswordTwoLabel}
                        style={this.state.password_two_style} UpdatePasswordTwoStyle={this.UpdatePasswordTwoStyle} />
                    <br />
                    <button onClick={this.onClickRegButton}>Далее</button>
                </div>
            </div>
        );
    }
}

export default Registration;