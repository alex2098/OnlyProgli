import React, { Component } from "react";
import { withRouter } from "react-router";
import Modal from "react-modal";

import Header from "./components/Header";
import Menu from "./components/Menu";
import Search from "./components/Search";
import ItemUserCompetition from "./components/ItemUserCompetition";
import NamePage from "./components/NamePage";
import LoadingPage from "./components/LoadingPage";

import ConvertTime from "./function/ConvertTime";

let host_name = "https://" + document.location.host;

Modal.setAppElement("#root");

class UserCompetitions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search_name: "",
            search_begin: "",
            search_end: "",
            competitions: undefined,
            index_delete_selected: undefined,
            competition_selected: sessionStorage.getItem("competition"),
            user_id: undefined,
            is_data_received: false,
            is_button_back: false,
            is_button_forward: false,
            is_open_exit_modal: false,
            is_open_modal: false
        };
    }

    loadingData = async () => {
        const is_auth = await this.props.IsAuth();
        if (!is_auth) {
            return;
        }
        const params = this.props.match.params;
        const min = 30 * params.page;
        const max = 30 * (params.page + 1) - 1;
        const name = params.name;
        const begin = params.begin;
        const end = params.end;
        const response = await fetch(`${host_name}/api/competition/getlist/user/${min}&${max}&${name}&${begin}&${end}`, {
            method: "GET",
            headers: { "Authorization": "Bearer " + localStorage.getItem("user") }
        });
        if (response.ok) {
            const result = await response.json();
            let competition = result.value.competitions;
            for (let items of competition) {
                items.beginDate = ConvertTime(items.beginDate).replace("T", " ");
                items.endDate = ConvertTime(items.endDate).replace("T", " ");
            }
            this.setState({
                competitions: competition,
                is_button_forward: result.value.forward,
                is_button_back: (params.page > 0) ? true : false,
                is_data_received: true,
                search_name: name.substring(5),
                search_begin: (begin === "0") ? "" : new Date(Number(begin)).toISOString().substring(0, 16),
                search_end: (end === "0") ? "" : new Date(Number(end)).toISOString().substring(0, 16),
                user_id: result.value.user
            });
        }
    }

    onChangeSearchName = event => this.setState({ search_name: event.target.value });
    onChangeSearchBegin = event => this.setState({ search_begin: event.target.value });
    onChangeSearchEnd = event => this.setState({ search_end: event.target.value });

    onClickSearch = () => {
        const begin = (this.state.search_begin === "") ? 0 : new Date(this.state.search_begin).getTime();
        const end = (this.state.search_end === "") ? 0 : new Date(this.state.search_end).getTime();
        this.props.history.push(`/user/competitions/0&name=${this.state.search_name}&${begin}&${end}`);
        this.setState({ is_data_received: false });
        this.loadingData();
    }

    onClickExit = value => {
        this.setState({
            is_open_exit_modal: true,
            index_delete_selected: value
        });
    }

    onClickSelected = value => {
        sessionStorage.setItem("competition", this.state.competitions[value].id);
        if (this.state.competitions[value].userId === this.state.user_id) {
            sessionStorage.setItem("author", " ");
        }
        else {
            sessionStorage.removeItem("author");
        }
        this.setState({ competition_selected: this.state.competitions[value].id });
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

    closeModal = () => {
        let competitions = this.state.competitions;
        competitions.splice(this.state.index_delete_selected, 1);
        this.setState({
            is_open_modal: false,
            competitions: competitions
        });
    }
    closeExitModal = () => this.setState({ is_open_exit_modal: false });

    onClickExitUser = () => {
        this.setState({
            is_open_modal: true,
            is_open_exit_modal: false
        });
        const id = this.state.competitions[this.state.index_delete_selected].id;
        fetch(`${host_name}/api/competition/delete/user/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + localStorage.getItem("user") }
        });
    }

    componentDidMount() {
        this.loadingData();
    }

    render() {
        if (this.state.is_data_received) {
            return (
                <div>
                    <Header />
                    <Menu />
                    <div className="main">
                        <NamePage name="Личный список соревнований" />
                        <Search name={this.state.search_name} onChangeName={this.onChangeSearchName}
                            begin={this.state.search_begin} onChangeBegin={this.onChangeSearchBegin}
                            end={this.state.search_end} onChangeEnd={this.onChangeSearchEnd}
                            onClickSearch={this.onClickSearch} />
                        {this.state.competitions.map((items, index) =>
                            <ItemUserCompetition name={items.name} begin_date={items.beginDate}
                                end_date={items.endDate} description={items.description}
                                key={index} competition_id={items.id}
                                is_author={(items.userId === this.state.user_id)}
                                is_finish={(Date.parse(items.endDate) < new Date().getTime())}
                                is_selected={Number(this.state.competition_selected) === items.id}
                                onClickExit={() => this.onClickExit(index)}
                                onClickSelected={() => this.onClickSelected(index)} />
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
                    <Modal isOpen={this.state.is_open_exit_modal}
                        shouldCloseOnOverlayClick={false}
                        className="Modal"
                        overlayClassName="Overlay">
                        <p>Выйти из соревнования?</p>
                        <button onClick={this.onClickExitUser}>
                            Да
                        </button>
                        <button onClick={this.closeExitModal}>
                            Отмена
                        </button>
                    </Modal>
                    <Modal isOpen={this.state.is_open_modal}
                        onRequestClose={this.closeModal}
                        className="Modal"
                        overlayClassName="Overlay">
                        <p>Вы вышли из соревнования</p>
                        <button onClick={this.closeModal}>
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
                        <NamePage name="Личный список соревнований" />
                        <LoadingPage />
                    </div>
                </div>
            );
        }
    }
}

export default withRouter(UserCompetitions);
