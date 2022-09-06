import React, { Component } from "react";
import { withRouter } from "react-router";
import CryptoJS from "crypto-js";
import Modal from "react-modal";

import Header from "./components/Header";
import Menu from "./components/Menu";
import NamePage from "./components/NamePage";
import InputTask from "./components/InputTask";
import PasswordOne from "./components/PasswordOne";
import PasswordTwo from "./components/PasswordTwo";
import LoadingPage from "./components/LoadingPage";
import Toggle from "./components/Toggle";
import TableCompetitionSettings from "./components/TableCompetitionSettings";

import ConvertTime from "./function/ConvertTime";

let host_name = "https://" + document.location.host;

Modal.setAppElement("#root");

class UpdateCompetition extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            name_label: "Название",
            name_style: "input_current",

            description: "",

            begin_date: "",
            begin_date_label: "Дата и время начала соревнования",
            begin_date_style: "input_current",

            end_date: "",
            end_date_label: "Дата и время завершения соревнования",
            end_date_style: "input_current",

            password_old: "",
            password_one: "",
            password_one_label: "Пароль",
            password_one_style: "input_current",

            password_two: "",
            password_two_label: "Пароль (еще раз)",
            password_two_style: "input_current",

            users: undefined,

            is_open_password: false,
            is_open_modal: false,
            is_open_delete_modal: false,
            is_open_true_delete_modal: false,
            is_data_received: false,
            toggle: true
        };
    }

    UpdateToggle = value => this.setState({ toggle: value });

    onChangeName = event => this.setState({ name: event.target.value });
    UpdateNameLabel = value => this.setState({ name_label: value });
    UpdateNameStyle = value => this.setState({ name_style: value });

    onChangeDescription = event => this.setState({ description: event.target.value });

    UpdateBeginDate = value => {
        this.setState({
            begin_date: value,
            begin_date_label: "Дата и время начала соревнования",
            begin_date_style: "input_current"
        });
    }
    UpdateEndDate = value => {
        this.setState({
            end_date: value,
            end_date_label: "Дата и время завершения соревнования",
            end_date_style: "input_current"
        });
    }

    onChangePasswordOne = event => this.setState({ password_one: event.target.value });
    UpdatePasswordOneLabel = value => this.setState({ password_one_label: value });
    UpdatePasswordOneStyle = value => this.setState({ password_one_style: value });

    onChangePasswordTwo = event => this.setState({ password_two: event.target.value });
    UpdatePasswordTwoLabel = value => this.setState({ password_two_label: value });
    UpdatePasswordTwoStyle = value => this.setState({ password_two_style: value });

    closeModal = () => this.setState({ is_open_modal: false });
    closeDeleteModal = () => this.setState({ is_open_delete_modal: false });
    openDeleteModel = () => this.setState({ is_open_delete_modal: true });

    closeTrueDeleteModal = () => {
        this.setState({ is_open_true_delete_modal: false });
        this.props.history.push("/home");
    }

    onСhangeOpen = event => {
        const flag = event.target.value;
        if (flag === "true") {
            this.setState({ is_open_password: true });
        }
        else {
            this.setState({ is_open_password: false });
        }
    }

    onClickUpdateButton = async () => {
        const is_auth = await this.props.IsAuth();
        if (!is_auth) {
            return;
        }
        let flag = false;
        if (this.state.name.length === 0) {
            this.setState({
                name_label: "Пустое поле!",
                name_style: "input_error"
            });
            flag = true;
        }
        if (this.state.begin_date.length === 0) {
            this.setState({
                begin_date_label: "Пустое поле!",
                begin_date_style: "input_error"
            });
            flag = true;
        }
        if (this.state.end_date.length === 0) {
            this.setState({
                end_date_label: "Пустое поле!",
                end_date_style: "input_error"
            });
            flag = true;
        }
        if (this.state.is_open_password && this.state.password_old === null) {
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
        }
        if (flag || this.state.name_style === "input_error" ||
            this.state.begin_date_style === "input_error" || this.state.end_date_style === "input_error" ||
            this.state.password_one_style === "input_error" || this.state.password_two_style === "input_error") {
            return;
        }

        let users_id = [];
        for (let items of this.state.users) {
            if (!items[2]) {
                users_id.push(items[0]);
            }
        }
        const update = {
            competition: {
                name: this.state.name,
                description: this.state.description,
                beginDate: new Date(this.state.begin_date),
                endDate: new Date(this.state.end_date),
                open: this.state.is_open_password,
                password: (!this.state.is_open_password) ? null :
                    (this.state.password_one.length === 0) ? this.state.password_old :
                    CryptoJS.SHA256(this.state.password_one).toString()
            },
            users: users_id
        };
        const id = this.props.match.params.competition_id;
        const response = await fetch(`${host_name}/api/competition/update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                "Authorization": "Bearer " + localStorage.getItem("user")
            },
            body: JSON.stringify(update)
        });
        if (response.ok) {
            let users = new Array();
            for (let items of this.state.users) {
                if (!users_id.includes(items[0])) {
                    users.push(items);
                }
            }
            this.setState({
                is_open_modal: true,
                users: users
            });
        }
        else if (response.status === 404) {
            sessionStorage.clear();
            this.props.history.push("/home");
        }
        else {
            this.setState({
                name_label: "Данное название уже существует!",
                name_style: "input_error"
            });
        }
    }

    onClickDeleteButton = async () => {
        const is_auth = await this.props.IsAuth();
        if (!is_auth) {
            return;
        }
        const id = this.props.match.params.competition_id;
        fetch(`${host_name}/api/competition/delete/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + localStorage.getItem("user") }
        });
        this.setState({
            is_open_delete_modal: false,
            is_open_true_delete_modal: true
        });
    }

    onClickDeleteUser = value => {
        let users = this.state.users;
        users[value][2] = false;
        this.setState({ users: users });
    }

    async componentDidMount() { 
        const is_auth = await this.props.IsAuth();
        if (!is_auth) {
            return;
        }
        const id = this.props.match.params.competition_id;
        const response = await fetch(`${host_name}/api/competition/get/${id}`, {
            method: "GET",
            headers: { "Authorization": "Bearer " + localStorage.getItem("user") }
        });
        if (response.ok) {
            const result = await response.json();
            let users = new Array();
            for (let items of result.value.users) {
                users.push(new Array(items.id, items.nickname, true));
            }
            this.setState({
                name: result.value.competition.name,
                description: result.value.competition.description,
                begin_date: ConvertTime(result.value.competition.beginDate),
                end_date: ConvertTime(result.value.competition.endDate),
                is_open_password: result.value.competition.open,
                is_open_password_old: result.value.competition.open,
                password_old: result.value.competition.password,
                users: users,
                is_data_received: true
            });
        }
        else {
            sessionStorage.clear();
            this.props.history.push("/home");
        }
    }

    render() {
        if (this.state.is_data_received) {
            return (
                <div>
                    <Header />
                    <Menu />
                    <div className="main_full">
                        <NamePage name={"Настройки соревнования " + this.state.name_old} />
                        <div className="main_elements">
                            <Toggle name_page_1="Общие настройки"
                                name_page_2="Пользователи соревнования"
                                UpdateToggle={this.UpdateToggle}
                                toggle={this.state.toggle} />
                            {!this.state.toggle ||
                            <div>
                                <InputTask name={this.state.name} onChangeName={this.onChangeName}
                                name_label={this.state.name_label} UpdateNameLabel={this.UpdateNameLabel}
                                name_style={this.state.name_style} UpdateNameStyle={this.UpdateNameStyle}
                                description={this.state.description} onChangeDescription={this.onChangeDescription}
                                begin_date={this.state.begin_date} UpdateBeginDate={this.UpdateBeginDate}
                                begin_date_label={this.state.begin_date_label} begin_date_style={this.state.begin_date_style}
                                end_date={this.state.end_date} UpdateEndDate={this.UpdateEndDate}
                                end_date_label={this.state.end_date_label} end_date_style={this.state.end_date_style} />
                                <span className="input_current">Соревнование открытое / закрытое</span>
                                <br />
                                <select onChange={this.onСhangeOpen}>
                                    <option value="false">Открытое</option>
                                    <option value="true">Закрытое</option>
                                </select>
                                {!this.state.is_open_password ||
                                <div>
                                    <PasswordOne password_one={this.state.password_one} onChangePasswordOne={this.onChangePasswordOne}
                                        label={this.state.password_one_label} UpdatePasswordOneLabel={this.UpdatePasswordOneLabel}
                                        style={this.state.password_one_style} UpdatePasswordOneStyle={this.UpdatePasswordOneStyle} />
                                    <PasswordTwo password_one={this.state.password_one}
                                        password_two={this.state.password_two} onChangePasswordTwo={this.onChangePasswordTwo}
                                        label={this.state.password_two_label} UpdatePasswordTwoLabel={this.UpdatePasswordTwoLabel}
                                        style={this.state.password_two_style} UpdatePasswordTwoStyle={this.UpdatePasswordTwoStyle} />
                                </div>}
                                </div>}
                            {this.state.toggle || <TableCompetitionSettings user={this.state.users} onClick={this.onClickDeleteUser} />}
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
                        <p>Удалить соревнование?</p>
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
                        <p>Соревнование было удалено</p>
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
                        <NamePage name="Настройки соревнования" />
                        <LoadingPage />
                    </div>
                </div>
            );
        }
    }
}

export default withRouter(UpdateCompetition);
