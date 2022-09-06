import React, { Component } from "react";
import Modal from "react-modal";
import CryptoJS from "crypto-js";

import Header from "./components/Header";
import Menu from "./components/Menu";
import NamePage from "./components/NamePage";
import InputTask from "./components/InputTask";
import PasswordOne from "./components/PasswordOne";
import PasswordTwo from "./components/PasswordTwo";

let host_name = "https://" + document.location.host;

Modal.setAppElement("#root");

class CreateCompetition extends Component {
    constructor(props) {
        super(props);
        this.props.IsAuth();
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

            password_one: "",
            password_one_label: "Пароль",
            password_one_style: "input_current",

            password_two: "",
            password_two_label: "Пароль (еще раз)",
            password_two_style: "input_current",

            is_open_password: false,
            is_open_modal: false
        };
    }

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

    closeModal = () => this.setState({
        is_open_modal: false,
        name: "",
        description: "",
        begin_date: "",
        end_date: "",
        is_open_password: false,
        password_one: "",
        password_two: ""
    });

    onСhangeOpen = event => {
        const flag = event.target.value;
        if (flag === "true") {
            this.setState({ is_open_password: true });
        }
        else {
            this.setState({ is_open_password: false });
        }
    }

    onClickCreate = async () => {
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
        if (this.state.is_open_password) {
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

        const competition = {
            name: this.state.name,
            description: this.state.description,
            beginDate: new Date(this.state.begin_date),
            endDate: new Date(this.state.end_date),
            open: this.state.is_open_password,
            password: this.state.is_open_password ? CryptoJS.SHA256(this.state.password_one).toString() : null
        };
        const response = await fetch(`${host_name}/api/competition/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                "Authorization": "Bearer " + localStorage.getItem("user")
            },
            body: JSON.stringify(competition)
        });
        if (response.ok) {
            this.setState({ is_open_modal: true });
        }
        else {
            this.setState({
                name_label: "Данное название уже существует!",
                name_style: "input_error"
            });
        }
    }

    render() {
        return (
            <div>
                <Header />
                <Menu />
                <div className="main_full">
                    <NamePage name="Создание соревнования" /> 
                    <div className="main_elements">
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
                    </div>
                    <div className="main_button">
                        <button onClick={this.onClickCreate}>
                            Создать
                        </button>
                    </div>
                </div>
                <Modal isOpen={this.state.is_open_modal}
                    onRequestClose={this.closeModal}
                    className="Modal"
                    overlayClassName="Overlay">
                    <p>Соревнование было создано</p>
                    <button onClick={this.closeModal}>
                        Ок
                    </button>
                </Modal>
            </div>
        );
    }
}

export default CreateCompetition;
