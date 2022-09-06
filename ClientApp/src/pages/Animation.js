import React, { Component } from "react";
import { withRouter } from "react-router";

import Header from "./components/Header";
import NamePage from "./components/NamePage";
import LoadingPage from "./components/LoadingPage";
import Field from "./components/Field";

import Interpreter from "./function/Interpreter";

import style_animation from "./css/MenuAnimation.module.css";
import style from "./css/SolutionTask.module.css";

let host_name = "https://" + document.location.host;

class SolutionTask extends Component {
    constructor(props) {
        super(props);
        this.Interpreter = new Interpreter();
        this.state = {
            is_data_received: false,
            matrix: undefined,
            speed: 1,
            is_animation: false,
            comands_1: undefined,
            comands_2: undefined,
            copy_matrix: undefined
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

    onClickAnimation = value => {
        if (value) {
            this.Interpreter.setTwoPobot(this.state.matrix, this.state.comands_1, this.state.comands_2);
            this.setState({ matrix: JSON.parse(JSON.stringify(this.state.copy_matrix)) });
        }
        this.setState({ is_animation: value });
    }

    Animation = () => {
        setTimeout(() => {
            const result = this.Interpreter.computationTwoRobot();
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
        const id = this.props.match.params.duel_id;
        const response = await fetch(`${host_name}/api/solution/get/duel/${id}`, {
            method: "GET",
            headers: { "Authorization": "Bearer " + localStorage.getItem("user") }
        });
        if (response.ok) {
            const result = await response.json();
            let matrix = JSON.parse(result.value.task.matrix);
            for (let i = 0; i < matrix.length; i++) {
                for (let j = 0; j < matrix[i].length; j++) {
                    if (matrix[i][j] === "field_private") {
                        matrix[i][j] = "field_public"
                    }
                }
            }
            matrix[0][0] = "field_public robot_1 robot_direction_1";
            matrix[matrix.length - 1][matrix[0].length - 1] = "field_public robot_2 robot_direction_3";
            this.setState({
                is_data_received: true,
                matrix: matrix,
                copy_matrix: JSON.parse(JSON.stringify(matrix)),
                comands_1: result.value.solution_1,
                comands_2: result.value.solution_2
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
                        <span>Участник 1 в левом верхнем углу</span>
                        <span>Участник 2 в правом нижнем углу</span>
                        <div className={style_animation.div_button}>
                            {this.state.is_animation ||
                                <button onClick={() => this.onClickAnimation(true)}>
                                    Запустить
                                </button>}
                            {!this.state.is_animation ||
                                <button onClick={() => this.onClickAnimation(false)}>
                                    Остановить
                                </button>}
                        </div>
                    </div>
                    <div className="main_full">
                        <NamePage name="Анимация соревнования между двумя исполнителями" />
                        <div className={style.div_animation}>
                            <Field matrix={this.state.matrix} />
                        </div>
                    </div>
                </div>
            );
        }
        else {
            return (
                <div>
                    <Header />
                    <div className="main_full">
                        <NamePage name="Анимация соревнования между двумя исполнителями" />
                        <LoadingPage />
                    </div>
                </div>
            );
        }
    }
}

export default withRouter(SolutionTask);