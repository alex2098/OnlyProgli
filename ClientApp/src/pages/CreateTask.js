import React, { Component } from "react";
import Modal from "react-modal";
import { withRouter } from "react-router";

import Header from "./components/Header";
import Menu from "./components/Menu";
import NamePage from "./components/NamePage";
import InputTask from "./components/InputTask";
import Toggle from "./components/Toggle";
import CreateField from "./components/CreateField";
import Element from "./components/Element";

import style from "./css/MenuElement.module.css";

let host_name = "https://" + document.location.host;

Modal.setAppElement("#root");

class CreateTask extends Component {
    constructor(props) {
        super(props);
        let matrix_1 = [];
        for (let i = 0; i < 2; i++) {
            matrix_1.push(Array(5).fill("field_public"));
        }
        matrix_1[0][0] = "field_private";
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

            w: 5,
            h: 5,
            matrix_1: matrix_1,
            matrix_2: undefined,

            selected_element: undefined,

            is_open_modal: false,
            toggle: true
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

    onChangeW = event => this.setState({ w: event.target.value });
    onChangeH = event => this.setState({ h: event.target.value });

    onCheckW = () => {
        if (this.state.w < 5 || this.state.w === NaN) {
            this.setState({ w: 5 });
        }
        if (this.state.w > 127) {
            this.setState({ w: 127 });
        }
    }

    onCheckH = () => {
        if (this.state.h < 5 || this.state.h === NaN) {
            this.setState({ h: 5 });
        }
        if (this.state.h > 127) {
            this.setState({ h: 127 });
        }
    }

    onClickMatrixCells = event => {
        if (this.state.selected_element === undefined) {
            return;
        }
        const h = event.target.parentNode.rowIndex;
        const w = event.target.cellIndex;
        let matrix_1 = this.state.matrix_1;
        let matrix_2 = this.state.matrix_2;
        matrix_1[h][w] = this.state.selected_element;
        if (this.state.selected_element === "field_public") {
            matrix_2[matrix_2.length - h - 1][matrix_2[0].length - w - 1] = "field_private";
        }
        else {
            matrix_2[matrix_2.length - h - 1][matrix_2[0].length - w - 1] = this.state.selected_element;
        }
        this.setState({
            matrix_1: matrix_1,
            matrix_2: matrix_2
        });
    }
     
    UpdateToggle = value => {
        if (this.state.toggle === true) {
            let matrix_1 = this.state.matrix_1;
            const size_h = parseInt(this.state.h / 2);
            if (this.state.w > matrix_1[0].length) {
                for (let i = 0; i < matrix_1.length; i++) {
                    const size = this.state.w - matrix_1[i].length;
                    for (let j = 0; j < size; j++) {
                        matrix_1[i].push("field_public");
                    }
                }
            }
            else {
                for (let i = 0; i < matrix_1.length; i++) {
                    matrix_1[i].length = this.state.w;
                }
            }
            if (size_h > matrix_1.length) {
                const size = size_h - matrix_1.length;
                for (let i = 0; i < size; i++) {
                    matrix_1.push(Array(matrix_1[0].length).fill("field_public"));
                }
            }
            else {
                matrix_1.length = size_h;
            }
            let matrix_2 = [];
            if (matrix_1.length < (this.state.h - size_h)) {
                matrix_2.push(Array(matrix_1[0].length).fill("field_private"));
            }
            for (let i = matrix_1.length - 1; i >= 0; i--) {
                let items = [];
                for (let j = matrix_1[i].length - 1; j >= 0; j--) {
                    if (matrix_1[i][j] !== "field_public") {
                        items.push(matrix_1[i][j]);
                    }
                    else {
                        items.push("field_private");
                    }
                }
                matrix_2.push(items);
            }
            this.setState({
                matrix_1: matrix_1,
                matrix_2: matrix_2
            });
        }
        this.setState({ toggle: value });
    }

    closeModal = () => {
        let matrix_1 = [];
        for (let i = 0; i < 2; i++) {
            matrix_1.push(Array(5).fill("field_public"));
        }
        matrix_1[0][0] = "field_private";
        this.setState({
            is_open_modal: false,
            name: "",
            description: "",
            begin_date: "",
            end_date: "",
            w: 5,
            h: 5,
            matrix_1: matrix_1,
            matrix_2: undefined,
            toggle: true
        });
    }

    onClickCreateButton = async () => {
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
        let matrix_2 = [...this.state.matrix_2];
        for (let i = 0; i < matrix_2.length; i++) {
            for (let j = 0; j < matrix_2[i].length; j++) {
                if (matrix_2 === "field_private") {
                    matrix_2[i][j] = "field_public";
                }
            }
        }
        const create = {
            name: this.state.name,
            description: this.state.description,
            beginDate: new Date(this.state.begin_date),
            endDate: new Date(this.state.end_date),
            matrix: JSON.stringify(this.state.matrix_1.concat(matrix_2)),
            competitionId: sessionStorage.getItem("competition")
        };
        const response = await fetch(`${host_name}/api/task/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                "Authorization": "Bearer " + localStorage.getItem("user")
            },
            body: JSON.stringify(create)
        });
        if (response.ok) {
            this.setState({ is_open_modal: true });
        }
        else if (response.status === 404) {
            sessionStorage.clear();
            this.props.history.push("/home");
        }
        else {
            this.setState({
                name_label: "Данное название уже существует в данном соревновании!",
                name_style: "input_error"
            });
        }
    }

    async componentDidMount() {
        const is_auth = await this.props.IsAuth();
        if (!is_auth) {
            return;
        }
        const id = sessionStorage.getItem("competition");
        if (id === null || id.length === 0) {
            sessionStorage.clear();
            this.props.history.push("/home");
            return;
        }
        const response = await fetch(`${host_name}/api/task/check/author/${id}`, {
            method: "POST",
            headers: { "Authorization": "Bearer " + localStorage.getItem("user") }
        });
        if (response.ok) {
            sessionStorage.setItem("author", " ");
        }
        else {
            sessionStorage.clear();
            this.props.history.push("/home");
        }
    }

    render() {
        return (
            <div>
                <Header />
                <Menu />
                <div className="main_full">
                    <NamePage name="Создание задачи" />
                    <div className="main_elements">
                        <Toggle name_page_1="Параметры"
                            name_page_2="Игровое поле"
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
                                <span className="input_current">Ширина игрового поля</span>
                                <br />
                                <input type="number"
                                    value={this.state.w}
                                    onChange={this.onChangeW}
                                    onBlur={this.onCheckW}
                                    min="5"
                                    max="127" />
                                <br />
                                <span className="input_current">Высота игрового поля</span>
                                <br />
                                <input type="number"
                                    value={this.state.h}
                                    onChange={this.onChangeH}
                                    onBlur={this.onCheckH}
                                    min="5"
                                    max="127" />
                            </div>}
                        {this.state.toggle ||
                            <div>
                                <CreateField matrix_1={this.state.matrix_1}
                                    matrix_2={this.state.matrix_2}
                                    onClick={this.onClickMatrixCells} />
                                <div className={style.div_create}>
                                    <Element name="Предмет"
                                    element="field_item"
                                        is_select={this.state.selected_element === "field_item"}
                                        onClickFalse={() => this.setState({ selected_element: undefined })}
                                        onClickTrue={() => this.setState({ selected_element: "field_item" })} />
                                    <Element name="Стена"
                                        element="field_barrier"
                                        is_select={this.state.selected_element === "field_barrier"}
                                        onClickFalse={() => this.setState({ selected_element: undefined })}
                                        onClickTrue={() => this.setState({ selected_element: "field_barrier" })} />
                                    <Element name="Удалить"
                                        is_select={this.state.selected_element === "field_public"}
                                        onClickFalse={() => this.setState({ selected_element: undefined })}
                                        onClickTrue={() => this.setState({ selected_element: "field_public" })} />
                                </div>
                            </div>}
                    </div>
                    <div className="main_button">
                        <button onClick={this.onClickCreateButton}>
                            Создать
                        </button>
                    </div>
                </div>
                <Modal isOpen={this.state.is_open_modal}
                    onRequestClose={this.closeModal}
                    className="Modal"
                    overlayClassName="Overlay">
                    <p>Задача была создана</p>
                    <button onClick={this.closeModal}>
                        Ок
                    </button>
                </Modal>
            </div>
        );
    }
}

export default withRouter(CreateTask);
