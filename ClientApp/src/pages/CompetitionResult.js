import React, { Component } from "react";
import { withRouter } from "react-router";

import Header from "./components/Header";
import Menu from "./components/Menu";
import NamePage from "./components/NamePage";
import LoadingPage from "./components/LoadingPage";

import style from "./css/TableResult.module.css";

let host_name = "https://" + document.location.host;

class CompetitionResult extends Component {
    constructor(props) {
        super(props);
        this.state = {
            result: undefined,
            name: undefined,
            is_data_received: false
        };
    }

    async componentDidMount() {
        const is_auth = await this.props.IsAuth();
        if (!is_auth) {
            return;
        }
        const id = this.props.match.params.competition_id;
        const response = await fetch(`${host_name}/api/solution/get/result/${id}`, {
            method: "GET",
            headers: { "Authorization": "Bearer " + localStorage.getItem("user") }
        });
        if (response.ok) {
            const result = await response.json();
            this.setState({
                name: result.value.competition,
                result: result.value.model,
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
                    <div>
                        <Header />
                        <Menu />
                        <div className="main">
                            <NamePage name={"Результаты соревнования: " + this.state.name} />
                            <div className={style.div}>
                                <table className={style.table}>
                                    <thead>
                                        <tr className={style.tr}>
                                            <td className={style.td_1}>Имя участника</td>
                                            <td className={style.td_2}>Баллы</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.result.map((items, index) =>
                                            <tr key={index}>
                                                <td className={style.td_1}>
                                                    {items.name}
                                                </td>
                                                <td className={style.td_2}>
                                                    {items.points}
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
                        <NamePage name="Результаты соревнования" />
                        <LoadingPage />
                    </div>
                </div>
            );
        }
       
    }
}

export default withRouter(CompetitionResult);
