import React, { Component } from "react";
import Modal from "react-modal";
import { withRouter } from "react-router";

import Header from "./components/Header";
import Menu from "./components/Menu";
import NamePage from "./components/NamePage";
import InputTask from "./components/InputTask";
import LoadingPage from "./components/LoadingPage";

import ConvertTime from "./function/ConvertTime";

let host_name = "https://" + document.location.host;

Modal.setAppElement("#root");

class TaskSettings extends Component {
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

            competition_id: undefined,

            is_open_modal: false,
            is_open_delete_modal: false,
            is_open_true_delete_modal: false,
            is_data_received: false
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

    closeModal = () => this.setState({ is_open_modal: false });
    closeDeleteModal = () => this.setState({ is_open_delete_modal: false });
    openDeleteModel = () => this.setState({ is_open_delete_modal: true });

    closeTrueDeleteModal = () => {
        this.setState({ is_open_true_delete_modal: false });
        this.props.history.push("/home");
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
        if (flag || this.state.name_style === "input_error" ||
            this.state.begin_date_style === "input_error" || this.state.end_date_style === "input_error") {
            return;
        }
        const update =  {
            name: this.state.name,
            description: this.state.description,
            beginDate: new Date(this.state.begin_date),
            endDate: new Date(this.state.end_date),
            competitionId: this.state.competition_id
        };
        const id = this.props.match.params.task_id;
        const response = await fetch(`${host_name}/api/task/update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                "Authorization": "Bearer " + localStorage.getItem("user")
            },
            body: JSON.stringify(update)
        });
        if (response.ok) {
            this.setState({is_open_modal: true});
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
        const id = this.props.match.params.task_id;
        fetch(`${host_name}/api/task/delete/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + localStorage.getItem("user") }
        });
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
        const id = this.props.match.params.task_id;
        const response = await fetch(`${host_name}/api/task/get/settings/${id}`, {
            method: "GET",
            headers: { "Authorization": "Bearer " + localStorage.getItem("user") }
        });
        if (response.ok) {
            const result = await response.json();
            console.log(result.value)
            this.setState({
                name: result.value.name,
                description: result.value.description,
                begin_date: ConvertTime(result.value.beginDate),
                end_date: ConvertTime(result.value.endDate),
                competition_id: result.value.competitionId,
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
                        <NamePage name={"Настройки задачи: " + this.state.name} />
                        <div className="main_elements">
                            <InputTask name={this.state.name} onChangeName={this.onChangeName}
                                name_label={this.state.name_label} UpdateNameLabel={this.UpdateNameLabel}
                                name_style={this.state.name_style} UpdateNameStyle={this.UpdateNameStyle}
                                description={this.state.description} onChangeDescription={this.onChangeDescription}
                                begin_date={this.state.begin_date} UpdateBeginDate={this.UpdateBeginDate}
                                begin_date_label={this.state.begin_date_label} begin_date_style={this.state.begin_date_style}
                                end_date={this.state.end_date} UpdateEndDate={this.UpdateEndDate}
                                end_date_label={this.state.end_date_label} end_date_style={this.state.end_date_style} />
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
                        <p>Удалить задачу?</p>
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
                        <p>Задача была удалено</p>
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
                        <NamePage name="Настройки задачи" />
                        <LoadingPage />
                    </div>
                </div>
            );
        }
    }
}

export default withRouter(TaskSettings);
