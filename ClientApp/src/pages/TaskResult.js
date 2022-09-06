import React, { Component } from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";

import Header from "./components/Header";
import Menu from "./components/Menu";
import NamePage from "./components/NamePage";
import LoadingPage from "./components/LoadingPage";

import style from "./css/TableResult.module.css";

let host_name = "https://" + document.location.host;

class TaskResult extends Component {
    constructor(props) {
        super(props);
        this.state = {
            result: undefined,
            name: undefined,
            is_data_received: false,
            is_not_data: false
        };
    }

    async componentDidMount() {
        const is_auth = await this.props.IsAuth();
        if (!is_auth) {
            return;
        }
        const id = this.props.match.params.task_id;
        const response = await fetch(`${host_name}/api/solution/getlist/duel/${id}`, {
            method: "GET",
            headers: { "Authorization": "Bearer " + localStorage.getItem("user") }
        });
        if (response.ok) {
            const result = await response.json();
            this.setState({
                name: result.value.name,
                result: result.value.duels,
                is_data_received: true,
                is_not_data: result.value.duels.length === 0
            });
        }
        else {
            sessionStorage.clear();
            this.props.history.push("/home");
        }
    }
    render() {
        if (this.state.is_not_data) {
            return (
                <div>
                    <Header />
                    <Menu />
                    <div className="main_full">
                        <NamePage name={"Результаты задачи: " + this.state.name} />
                        <div className="main_elements">
                            <h2>Соревнование между программируемыми исполнителями не проводилось</h2>
                        </div>
                    </div>
                </div>
            );
        }
        if (this.state.is_data_received) {
            return (
                <div>
                    <div>
                        <Header />
                        <Menu />
                        <div className="main">
                            <NamePage name={"Результаты задачи: " + this.state.name} />
                            <div className={style.div}>
                                <table className={style.table}>
                                    <thead>
                                        <tr className={style.tr}>
                                            <td className={style.td_1}>Имя первого участника</td>
                                            <td className={style.td_1}>Имя второго участника</td>
                                            <td className={style.td_2}>Действие</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.result.map((items, index) =>
                                            <tr key={index}>
                                                <td className={[style.td_1, !items.win_1 || style.win].join(' ')}>
                                                    {items.name_1}
                                                </td>
                                                <td className={[style.td_1, !items.win_2 || style.win].join(' ')}>
                                                    {items.name_2}
                                                </td>
                                                <td className={style.td_2}>
                                                    <Link to={`/duel/${items.id}`}>
                                                        <button>
                                                            Посмотреть
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        else {
            return (
                <div>
                    <Header />
                    <Menu />
                    <div className="main_full">
                        <NamePage name="Результаты задачи" />
                        <LoadingPage />
                    </div>
                </div>
            );
        }

    }
}

export default withRouter(TaskResult);