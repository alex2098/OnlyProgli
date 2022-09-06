import React, { Component } from "react";
import CryptoJS from "crypto-js";
import { withRouter } from "react-router";
import Modal from "react-modal";

import Email from "./components/Email";
import Nickname from "./components/Nickname";
import PasswordOne from "./components/PasswordOne";
import PasswordTwo from "./components/PasswordTwo";
import Code from "./components/Code";
import Header from "./components/Header";
import Menu from "./components/Menu";
import NamePage from "./components/NamePage";
import LoadingPage from "./components/LoadingPage";

const host_name = "https://" + document.location.host;

Modal.setAppElement("#root");

class UserSettings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            email_label: "Электронная почта",
            email_style: "input_current",
            email_old: "",

            nickname: "",
            nickname_label: "Имя",
            nickname_style: "input_current",
            nickname_old: "",

            password_old: "",
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

            is_open_code_modal: false,
            is_open_modal: false,
            is_open_delete_modal: false,
            is_open_true_delete_modal: false,
            is_data_received: false
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

    closeCodeModal = () => this.setState({ is_open_code_modal: false });
    closeModal = () => this.setState({ is_open_modal: false }); 
    closeDeleteModal = () => this.setState({ is_open_delete_modal: false });
    openDeleteModel = () => this.setState({ is_open_delete_modal: true });

    closeTrueDeleteModal = () => {
        this.setState({ is_open_true_delete_modal: false });
        this.props.history.push("/");
    }

    UpdateUser = async () => {
        const is_auth = await this.props.IsAuth();
        if (!is_auth) {
            return;
        }
        if (this.state.password_one.length === 0 &&
            this.state.email_old === this.state.email &&
            this.state.nickname_old === this.state.nickname) {
            return;
        }
        const update = {
            email: this.state.email,
            nickname: this.state.nickname,
            password: (this.state.password_one.length === 0) ? this.state.password_old : CryptoJS.SHA256(this.state.password_one).toString()
        };
        const response = await fetch(`${host_name}/api/user/update`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                "Authorization": "Bearer " + localStorage.getItem("user")
            },
            body: JSON.stringify(update)
        });
        if (response.ok) {
            const result = await response.json();
            this.setState({
                is_open_code_modal: false,
                is_open_modal: true,
                email_old: update.email,
                nickname_old: update.nickname,
                password_old: update.password
            });
            localStorage.setItem("user", result.value.token);
            this.props.UpdateTimeEndToken(result.value.date);
        }
    }

    onClickUpdateButton = async () => {
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
        if (flag || this.state.email_style === "input_error" || this.state.nickname_style === "input_error" ||
            this.state.password_one_style === "input_error" || this.state.password_two_style === "input_error") {
            return;
        }

        if (this.state.email_old !== this.state.email || this.state.nickname_old !== this.state.nickname) {
            const check = {
                email: (this.state.email_old !== this.state.email) ? this.state.email : null,
                nickname: (this.state.nickname_old !== this.state.nickname) ? this.state.nickname : null
            };
            const response = await fetch(`${host_name}/api/user/check`, {
                method: "POST",
                headers: { "Content-Type": "application/json;charset=utf-8" },
                body: JSON.stringify(check)
            });
            if (response.ok) {
                if (this.state.email_old !== this.state.email) {
                    const result = await response.json();
                    this.setState({
                        is_open_code_modal: true,
                        code_correct: result.value
                    });
                }
                else {
                    this.UpdateUser();
                }
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
        else {
            this.UpdateUser();
        }
    }

    onClickCodeButton = () => {
        if (this.state.code.length === 0) {
            return this.setState({
                code_label: "Пустое поле!",
                code_style: "input_error"
            });
        }
        if (this.state.code === this.state.code_correct) {
            this.UpdateUser(); 
        }
        else {
            this.setState({
                code_label: "Неверно введенный код!",
                code_style: "input_error"
            });
        }
    }

    onClickDeleteButton = async () => {
        const is_auth = await this.props.IsAuth();
        if (!is_auth) {
            return;
        }
        fetch(`${host_name }/api/user/delete`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + localStorage.getItem("user") }
        });
        localStorage.clear();
        sessionStorage.clear();
        this.setState({
            is_open_delete_modal: false,
            is_open_true_delete_modal: true
        });
    }

    async componentDidMount() {
        const is_auth = await this.props.IsAuth();
        if (!is_auth) {
            return;
        }
        const response = await fetch(`${host_name}/api/user/get`, {
            method: "GET",
            headers: { "Authorization": "Bearer " + localStorage.getItem("user") }
        });
        if (response.ok) {
            const result = await response.json();
            this.setState({
                email_old: result.value.email,
                nickname_old: result.value.nickname,
                password_old: result.value.password,
                email: result.value.email,
                nickname: result.value.nickname,
                is_data_received: true
            });
        }
    }

    render() {
        if (this.state.is_data_received) {
            return (
                <div>
                    <Header />
                    <Menu />
                    <div className="main_full">
                        <NamePage name="Настройки" />
                        <div className="main_elements">
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
                        </div>
                        <div className="main_button">
                            <button onClick={this.onClickUpdateButton}>
                                Изменить
                            </button>
                            <button onClick={this.openDeleteModel}>
                                Удалить
                            </button>
                        </div>
                    </div>
                    <Modal isOpen={this.state.is_open_code_modal}
                        shouldCloseOnOverlayClick={false}
                        className="Modal"
                        overlayClassName="Overlay">
                        <p>Подтверждение электронной почты</p>
                        <Code code={this.state.code} onChangeCode={this.onChangeCode}
                            label={this.state.code_label} UpdateCodeLabel={this.UpdateCodeLabel}
                            style={this.state.code_style} UpdateCodeStyle={this.UpdateCodeStyle} />
                        <button onClick={this.onClickCodeButton}>
                            Подтвердить
                        </button>
                        <button onClick={this.closeCodeModal}>
                            Отменить
                        </button>
                    </Modal>
                    <Modal isOpen={this.state.is_open_modal}
                        onRequestClose={this.closeModal}
                        className="Modal"
                        overlayClassName="Overlay">
                        <p>Данные были изменены</p>
                        <button onClick={this.closeModal}>
                            Ок
                        </button>
                    </Modal>
                    <Modal isOpen={this.state.is_open_delete_modal}
                        shouldCloseOnOverlayClick={false}
                        className="Modal"
                        overlayClassName="Overlay">
                        <p>Удалить аккаунт?</p>
                        <button onClick={this.onClickDeleteButton}>
                            Удалить
                        </button>
                        <button onClick={this.closeDeleteModal} >
                            Отмена
                        </button>
                    </Modal>
                    <Modal isOpen={this.state.is_open_true_delete_modal}
                        onRequestClose={this.closeTrueDeleteModal}
                        className="Modal"
                        overlayClassName="Overlay">
                        <p>Аккаунт был удален</p>
                        <button onClick={this.closeTrueDeleteModal}>
                            Ок
                        </button>
                    </Modal>
                </div>
            );
        }
        else {
            return (
                <div>
                    <Header />
                    <Menu />
                    <div className="main_full">
                        <NamePage name="Настройки" />
                        <LoadingPage />
                    </div>
                </div>
            );
        }
    }
}

export default withRouter(UserSettings);
