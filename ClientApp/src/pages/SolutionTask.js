import React, { Component } from "react";
import Modal from "react-modal";
import { withRouter } from "react-router";

import MenuElement from "./components/MenuElement";
import Header from "./components/Header";
import NamePage from "./components/NamePage";
import LoadingPage from "./components/LoadingPage";
import Field from "./components/Field";
import Program from "./components/Program";

import Interpreter from "./function/Interpreter";

import style_animation from "./css/MenuAnimation.module.css";
import style from "./css/SolutionTask.module.css";

let host_name = "https://" + document.location.host;

Modal.setAppElement("#root");

class SolutionTask extends Component {
    constructor(props) {
        super(props);
        this.Interpreter = new Interpreter();
        this.state = {
            id: undefined,
            is_data_received: false,
            name: undefined,
            matrix: undefined,
            speed: 1,
            is_animation: false,
            comands: ["add"],
            selected_comand: undefined,
            selected_if: undefined,
            selected_delete: undefined,
            is_deleted_comand: false,
            is_deleted_if: false,
            copy_matrix: undefined,
            is_open_modal: false,
            is_open_error_modal: false,
            error: ""
        }
    }

    onCheckSpeed = () => {
        if (this.state.speed === NaN || this.state.speed < 5) {
            this.setState({ speed: 5 });
        }
        if (this.state.speed > 10) {
            this.setState({ speed: 10 });
        }
    }

    onClickSend = async () => {
        const is_auth = await this.props.IsAuth();
        if (!is_auth) {
            return;
        }
        const error = this.Interpreter.checkProgram(this.state.comands);
        if (error !== null) {
            return this.setState({
                error: error,
                is_open_error_modal: true
            });
        }
        const solution = {
            code: JSON.stringify(this.state.comands),
            taskId: this.state.id
        };
        const response = await fetch(`${host_name}/api/solution/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                "Authorization": "Bearer " + localStorage.getItem("user")
            },
            body: JSON.stringify(solution)
        });
        if (response.ok) {
            this.setState({ is_open_modal: true });
        }
        else {
            sessionStorage.clear();
            this.props.history.push("/home");
        }
    }

    onClickAddComand = event => {
        if (this.state.selected_comand === undefined) {
            return;
        }
        const h = event.target.parentNode.rowIndex;
        let comand = this.state.comands;
        if (comand.length === 1 && comand[0] === "add") {
            comand.splice(0, 1);
        }
        if (this.state.selected_comand === "begin_cycle_check") {
            comand.splice(parseInt(h / 2), 0, [this.state.selected_comand]);
        }
        else if (this.state.selected_comand === "begin_cycle_number") {
            comand.splice(parseInt(h / 2), 0, [this.state.selected_comand, 1]);
        }
        else if (this.state.selected_comand === "check") {
            comand.splice(parseInt(h / 2), 0, [this.state.selected_comand]);
        }
        else {
            comand.splice(parseInt(h / 2), 0, this.state.selected_comand);
        }
        this.setState({
            comands: comand,
            selected_comand: undefined
        });
    }

    onClickAddIf = (index, event) => {
        if (this.state.selected_if === undefined) {
            return;
        }
        let comand = this.state.comands;
        const h = event.target.parentNode.rowIndex;
        comand[index].splice(1 + parseInt(h / 2), 0, this.state.selected_if);;
        this.setState({
            comands: comand,
            selected_if: undefined
        });
    }

    onClickDeleteComand = index => {
        if (!this.state.is_deleted_comand) {
            return;
        }
        let comand = this.state.comands;
        comand.splice(index, 1);
        if (comand.length === 0) {
            comand.push("add");
        }
        this.setState({
            comands: comand
        });
    }

    onClickDeleteIf = (index, mini_index) => {
        if (!this.state.is_deleted_if) {
            return;
        }
        let comand = this.state.comands;
        comand[index].splice(mini_index, 1);
        this.setState({
            comands: comand
        });
    }

    onChangeNumber = (index, event) => {
        let comand = this.state.comands;
        if (event.target.value < 1) {
            comand[index][1] = 1;
        }
        else if (event.target.value > 1000) {
            comand[index][1] = 1000;
        }
        else {
            comand[index][1] = event.target.value;
        }
        this.setState({
            comands: comand
        });
    }

    onClickComand = value => {
        this.setState({
            selected_comand: value,
            is_deleted_if: false,
            is_deleted_comand: false
        });
    }

    onClickIf = value => {
        this.setState({
            selected_if: value,
            is_deleted_if: false,
            is_deleted_comand: false
        });
    }

    onClickAnimation = value => {
        if (value) {
            const error = this.Interpreter.checkProgram(this.state.comands);
            if (error !== null) {
                return this.setState({
                    error: error,
                    is_open_error_modal: true
                });
            }
            this.Interpreter.setOnePobot(this.state.matrix, this.state.comands);
            this.setState({ matrix: JSON.parse(JSON.stringify(this.state.copy_matrix)) });
        }
        this.setState({ is_animation: value });
    }

    Animation = () => {
        setTimeout(() => {
            const result = this.Interpreter.computationOneRobot();
            if (result === null) {
                this.setState({ is_animation: false });
            }
            else {
                this.setState({ matrix: result });
            }
        }, (1000 / this.state.speed));
    }

    async componentDidMount() {
        const is_auth = await this.props.IsAuth();
        if (!is_auth) {
            return;
        }
        const id = this.props.match.params.task_id;
        const response = await fetch(`${host_name}/api/task/get/${id}`, {
            method: "GET",
            headers: { "Authorization": "Bearer " + localStorage.getItem("user") }
        });
        if (response.ok) {
            const result = await response.json();
            let matrix = JSON.parse(result.value.matrix);
            for (let i = 0; i < matrix.length; i++) {
                for (let j = 0; j < matrix[i].length; j++) {
                    if (matrix[i][j] === "field_private") {
                        matrix[i][j] = "field_public"
                    }
                }
            }
            matrix[0][0] = "field_public robot_1 robot_direction_1";
            this.setState({
                is_data_received: true,
                name: result.value.name,
                id: result.value.id,
                matrix: matrix,
                copy_matrix: JSON.parse(JSON.stringify(matrix))
            });
        }
        else {
            sessionStorage.clear();
            this.props.history.push("/home");
        }
    }
    render() {
        if (this.state.is_data_received) {
            if (this.state.is_animation) {
                this.Animation();
            }
            return (
                <div>
                    <Header />
                    <div className={style_animation.div}>
                        <span className={style_animation.text}
                            onClick={() => this.props.history.goBack()}>
                            Вернуться назад
                        </span>
                        <div className={style_animation.div_input}>
                            <span>Скорость анимации</span>
                            <input type="number"
                                value={this.state.speed}
                                min="1"
                                max="10"
                                onChange={event => this.setState({ speed: event.target.value })}
                                onBlur={this.onCheckSpeed}
                                className={style_animation.input} />
                        </div>
                        <div className={style_animation.div_button}>
                            {this.state.is_animation ||
                            <button onClick={() => this.onClickAnimation(true)}>
                                Запустить
                            </button>}
                            {!this.state.is_animation ||
                            <button onClick={() => this.onClickAnimation(false)}>
                                Остановить
                            </button>}
                            <button onClick={this.onClickSend}>
                                Отправить
                            </button>
                        </div>
                    </div>
                    <div className="main_full">
                        <NamePage name={"Решение задачи " + this.state.name} />
                        <div className={style.div}>
                            <Field matrix={this.state.matrix} />
                        </div>
                        <div className={style.program}>
                            <table>
                                <tbody>
                                    {this.state.comands.map((items, index) =>
                                        <Program key={index}
                                            is_add_comand={this.state.selected_comand !== undefined
                                                && this.state.comands.length < 100}
                                            is_end={this.state.comands.length === (index + 1)}
                                            is_add_if={this.state.selected_if !== undefined}
                                            comand={items}
                                            onChangeNumber={(event) => this.onChangeNumber(index, event)}
                                            onClickDeleteComand={() => this.onClickDeleteComand(index)}
                                            onClickDeleteIf={(event) => this.onClickDeleteIf(index, event)}
                                            onClickIf={(event) => this.onClickAddIf(index, event)}
                                            onClickComand={this.onClickAddComand} />
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <MenuElement
                            is_delete_comand={this.state.is_deleted_comand}
                            is_delete_if={this.state.is_deleted_if}
                            onClickDeleteComand={value => this.setState({ is_deleted_comand: value })}
                            onClickDeleteIf={value => this.setState({ is_deleted_if: value })}
                            onClickIf={this.onClickIf}
                            onClickComand={this.onClickComand} />
                    </div>
                    <Modal isOpen={this.state.is_open_modal}
                        onRequestClose={() => this.setState({ is_open_modal: false })}
                        className="Modal"
                        overlayClassName="Overlay">
                        <p>Решение было отправлено</p>
                        <button onClick={() => this.setState({ is_open_modal: false })}>
                            Ок
                        </button>
                    </Modal>
                    <Modal isOpen={this.state.is_open_error_modal}
                        onRequestClose={() => this.setState({ is_open_error_modal: false })}
                        className="Modal"
                        overlayClassName="Overlay">
                        <p>{this.state.error}</p>
                        <button onClick={() => this.setState({ is_open_error_modal: false })}>
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
                    <div className="main_full">
                        <NamePage name="Решение задачи" />
                        <LoadingPage />
                    </div>
                </div>
            );
        }
    }
}

export default withRouter(SolutionTask);
