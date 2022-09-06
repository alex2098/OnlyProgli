import React, { Component } from "react";
import Modal from "react-modal";
import { withRouter } from "react-router";

import Header from "./components/Header";
import Menu from "./components/Menu";
import Search from "./components/Search";
import ItemTask from "./components/ItemTask";
import NamePage from "./components/NamePage";
import LoadingPage from "./components/LoadingPage";

import ConvertTime from "./function/ConvertTime";
import Interpreter from "./function/Interpreter";

let host_name = "https://" + document.location.host;

Modal.setAppElement("#root");

class Tasks extends Component {
    constructor(props) {
        super(props);
        this.Interpreter = new Interpreter();
        this.state = {
            name: "",
            search_name: "",
            search_begin: "",
            search_end: "",
            tasks: undefined,
            is_solution: undefined,
            is_data_received: false,
            is_button_back: false,
            is_button_forward: false,
            is_author: undefined,
            is_open_modal: false,
            solution: undefined,
            solution_max: 0,
            solution_count: 0,
            result: undefined,
            is_open_modal_result: false,
            field: undefined,
            index_1: 0,
            index_2: 0,
            is_selected_task: undefined
        };
    }

    loadingData = async () => {
        const is_auth = await this.props.IsAuth();
        if (!is_auth) {
            return;
        }
        const params = this.props.match.params;
        const id = params.competition_id;
        const min = 30 * params.page;
        const max = 30 * (params.page + 1) - 1;
        const name = params.name;
        const begin = params.begin;
        const end = params.end;
        const response = await fetch(`${host_name}/api/task/getlist/${id}/${min}&${max}&${name}&${begin}&${end}`, {
            method: "GET",
            headers: { "Authorization": "Bearer " + localStorage.getItem("user") }
        });
        if (response.ok) {
            const result = await response.json();
            let task = result.value.task;
            for (let items of task) {
                items.beginDate = ConvertTime(items.beginDate).replace("T", " ");
                items.endDate = ConvertTime(items.endDate).replace("T", " ");
            }
            this.setState({
                name: result.value.name,
                is_author: result.value.is_author,
                tasks: task,
                is_button_forward: result.value.forward,
                is_button_back: (params.page > 0) ? true : false,
                is_data_received: true,
                search_name: name.substring(5),
                search_begin: (begin === "0") ? "" : new Date(Number(begin)).toISOString().substring(0, 16),
                search_end: (end === "0") ? "" : new Date(Number(end)).toISOString().substring(0, 16),
                is_solution: result.value.is_solution
            });
        }
    }

    onChangeSearchName = event => this.setState({ search_name: event.target.value });
    onChangeSearchBegin = event => this.setState({ search_begin: event.target.value });
    onChangeSearchEnd = event => this.setState({ search_end: event.target.value });

    onClickSearch = () => {
        const begin = (this.state.search_begin === "") ? 0 : new Date(this.state.search_begin).getTime();
        const end = (this.state.search_end === "") ? 0 : new Date(this.state.search_end).getTime();
        this.props.history.push(`/competition/${this.props.match.params.competition_id}/0&name=${this.state.search_name}&${begin}&${end}`);
        this.setState({ is_data_received: false });
        this.loadingData();
    }


    onClickSolution = async value => {
        const is_auth = await this.props.IsAuth();
        if (!is_auth) {
            return;
        }
        const response = await fetch(`${host_name}/api/solution/getlist/${value}`, {
            method: "GET",
            headers: { "Authorization": "Bearer " + localStorage.getItem("user") }
        });
        if (response.ok) {
            const result = await response.json();
            const solution = result.value.solution;
            if (solution.length < 2) {
                return this.setState({ is_open_model_result: true });
            }
            this.setState({
                is_selected_task: value,
                solution: solution,
                is_open_modal: true,
                solution_max: solution.length * (solution.length - 1) / 2,
                solution_count: 0,
                result: new Array(),
                field: result.value.field,
                index_1: 0,
                index_2: 1
            });
        }
        else {
            sessionStorage.clear();
            this.props.history.push("/home");
        }
    }

    Calculation = async () => {
        if (this.state.solution_count >= this.state.solution_max) {
            const id = this.state.is_selected_task;
            const response = await fetch(`${host_name}/api/solution/addlist/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    "Authorization": "Bearer " + localStorage.getItem("user")
                },
                body: JSON.stringify(this.state.result)
            });
            if (response.ok) {
                this.setState({
                    is_open_modal: false,
                    is_open_modal_result: true
                });
            }
            else {
                sessionStorage.clear();
                this.props.history.push("/home");
            }
            return;
        }
        this.Interpreter.setTwoPobot(JSON.parse(JSON.stringify(this.state.field)),
            JSON.parse(this.state.solution[this.state.index_1].code),
            JSON.parse(this.state.solution[this.state.index_2].code));
        const result_duel = this.Interpreter.fullComputation();
        const result = this.state.result;
        let duel = {
            win_1: true,
            win_2: true,
            solutionId_1: this.state.solution[this.state.index_1].id,
            solutionId_2: this.state.solution[this.state.index_2].id
        };
        if (result_duel === 1) {
            duel.win_2 = false;
        }
        if (result_duel === 2) {
            duel.win_1 = false;
        }
        result.push(duel);
        this.setState({
            result: result,
            solution_count: this.state.solution_count + 1,
            index_1: (this.state.solution.length > (this.state.index_2 + 1)) ?
                this.state.index_1 : this.state.index_1 + 1,
            index_2: (this.state.solution.length > (this.state.index_2 + 1)) ?
                this.state.index_2 + 1 : this.state.index_1 + 2
        });
    }

    onClickBackButton = () => {
        this.math.params.page -= 1;
        this.setState({ is_data_received: false });
        this.loadingData();
    }

    onClickForwardButton = () => {
        this.math.params.page += 1;
        this.setState({ is_data_received: false });
        this.loadingData();
    } 

    componentDidMount() {
        this.loadingData();
    }

    render() {
        if (this.state.is_data_received) {
            if (this.state.is_open_modal) {
                this.Calculation();
            }
            return (
                <div>
                    <Header />
                    <Menu />
                    <div className="main">
                        <NamePage name={"Задачи соревнования: " + this.state.name} />
                        <Search name={this.state.search_name} onChangeName={this.onChangeSearchName}
                            begin={this.state.search_begin} onChangeBegin={this.onChangeSearchBegin}
                            end={this.state.search_end} onChangeEnd={this.onChangeSearchEnd}
                            onClickSearch={this.onClickSearch} />
                        {this.state.tasks.map((items, index) =>
                            <ItemTask name={items.name} begin_date={items.beginDate}
                                end_date={items.endDate} description={items.description}
                                key={index} task_id={items.id}
                                is_author={this.state.is_author}
                                is_finish={(Date.parse(items.endDate) < new Date().getTime())}
                                is_decided={this.state.is_solution.includes(0, items.id)}
                                onClick={() => this.onClickSolution(items.id)} />
                        )}
                        <div style={{ width: "100%", textAlign: "center" }}>
                            {!this.state.is_button_back ||
                                <button onClick={this.onClickBackButton}>
                                    Назад
                                </button>}
                            {!this.state.is_button_forward ||
                                <button onClick={this.onClickForwardButton}>
                                    Далее
                                </button>}
                        </div>
                    </div>
                    <Modal isOpen={this.state.is_open_modal}
                        shouldCloseOnOverlayClick={false}
                        className="Modal"
                        overlayClassName="Overlay">
                        <p>Идет расчет</p>
                        <progress max={this.state.solution_max} value={this.state.solution_count} />
                    </Modal>
                    <Modal isOpen={this.state.is_open_modal_result}
                        onRequestClose={() => this.setState({ is_open_modal_result: false })}
                        className="Modal"
                        overlayClassName="Overlay">
                        <p>Соревнование по задаче было проведено</p>
                        <button onClick={() => this.setState({ is_open_modal_result: false })}>
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
                        <NamePage name="Задачи сревнования" />
                        <LoadingPage />
                    </div>
                </div>
            );
        }
    }
}

export default withRouter(Tasks);