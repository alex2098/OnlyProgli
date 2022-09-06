import React, { Component } from "react";
import { withRouter } from "react-router";
import CryptoJS from "crypto-js";
import Modal from "react-modal";

import Header from "./components/Header";
import Menu from "./components/Menu";
import Search from "./components/Search";
import ItemCompetition from "./components/ItemCompetition";
import NamePage from "./components/NamePage";
import Password from "./components/Password";
import LoadingPage from "./components/LoadingPage";

import ConvertTime from "./function/ConvertTime";

let host_name = "https://" + document.location.host;

Modal.setAppElement("#root");

class Competitions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search_name: "",
            search_begin: "",
            search_end: "",
            competitions: undefined,
            is_button_forward: false,
            is_button_back: false,
            is_data_received: false,
            is_open_password_modal: false,
            is_open_modal: false,
            password: "",
            password_label: "Пароль",
            password_style: "input_current",
            competition_selected_index: undefined
        };
    }

    onChangeSearchName = event => this.setState({ search_name: event.target.value });
    onChangeSearchBegin = event => this.setState({ search_begin: event.target.value });
    onChangeSearchEnd = event => this.setState({ search_end: event.target.value });

    onChangePassword = event => this.setState({ password: event.target.value });
    UpdatePasswordLabel = value => this.setState({ password_label: value });
    UpdatePasswordStyle = value => this.setState({ password_style: value });

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
        const response = await fetch(`${host_name}/api/competition/getlist/${min}&${max}&${name}&${begin}&${end}`, {
            method: "GET",
            headers: { "Authorization": "Bearer " + localStorage.getItem("user") }
        });
        if (response.ok) {
            const result = await response.json();
            let competition = result.value.competitions;
            for (let items of competition) {
                items.flag = true;
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
                search_end: (end === "0") ? "" : new Date(Number(end)).toISOString().substring(0, 16)
            });
        }
    }

    onClickForwardButton = () => {
        this.math.params.page += 1;
        this.setState({ is_data_received: false });
        this.loadingData();
    }

    onClickBackButton = () => {
        this.math.params.page -= 1;
        this.setState({ is_data_received: false });
        this.loadingData();
    }

    onClickSearch = () => {
        const begin = (this.state.search_begin === "") ? 0 : new Date(this.state.search_begin).getTime();
        const end = (this.state.search_end === "") ? 0 : new Date(this.state.search_end).getTime();
        this.props.history.push(`/competitions/0&name=${this.state.search_name}&${begin}&${end}`);
        this.setState({ is_data_received: false });
        this.loadingData();
    }

    closePasswordModal = () => this.setState({ is_open_password_modal: false });
    closeModal = () => this.setState({ is_open_modal: false });

    AddCompetition = value => {
        fetch(`${host_name}/api/competition/add/user/${value}`, {
            method: "POST",
            headers: {"Authorization": "Bearer " + localStorage.getItem("user")}
        });
    }

    onClickPasswordButton = () => {
        const password = CryptoJS.SHA256(this.state.password).toString();
        const index = this.state.competition_selected_index;
        if (password === this.state.competitions[index].password) {
            let competitions = this.state.competitions;
            competitions[index].flag = false;
            this.setState({
                competitions: competitions,
                is_open_password_modal: false,
                is_open_modal: true
            });
            this.AddCompetition(competitions[index].id);
        }
        else {
            this.setState({
                password_label: "Неверно введен пароль!",
                password_style: "input_error"
            });
        }
    }

    onClickAdd = value => {
        if (this.state.competitions[value].open === true) {
            this.setState({
                is_open_password_modal: true,
                competition_selected_index: value
            });
        }
        else {
            let competitions = this.state.competitions;
            competitions[value].flag = false;
            this.setState({
                competitions: competitions,
                is_open_modal: true
            });
            this.AddCompetition(competitions[value].id);
        }
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
                        <NamePage name="Общий список соревнований" />
                        <Search name={this.state.search_name} onChangeName={this.onChangeSearchName}
                            begin={this.state.search_begin} onChangeBegin={this.onChangeSearchBegin}
                            end={this.state.search_end} onChangeEnd={this.onChangeSearchEnd}
                            onClickSearch={this.onClickSearch} />
                        {this.state.competitions.map((items, index) =>
                            <ItemCompetition name={items.name} begin_date={items.beginDate}
                                end_date={items.endDate} description={items.description}
                                is_button={items.flag} onClick={() => this.onClickAdd(index)}
                                key={index} />
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
                    <Modal isOpen={this.state.is_open_password_modal}
                        shouldCloseOnOverlayClick={false}
                        className="Modal"
                        overlayClassName="Overlay">
                        <p>Пароль</p>
                        <Password password={this.state.password} onChangePassword={this.onChangePassword}
                            label={this.state.password_label} UpdatePasswordLabel={this.UpdatePasswordLabel}
                            style={this.state.password_style} UpdatePasswordStyle={this.UpdatePasswordStyle} />
                        <button onClick={this.onClickPasswordButton}>
                            Вступить
                        </button>
                        <button onClick={this.closePasswordModal}>
                            Отменить
                        </button>
                    </Modal>
                    <Modal isOpen={this.state.is_open_modal}
                        onRequestClose={this.closeModal}
                        className="Modal"
                        overlayClassName="Overlay">
                        <p>Вы вступили в соревнование</p>
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
                        <NamePage name="Общий список соревнований" />
                        <LoadingPage />
                    </div>
                </div>
            );
        }
    }
}

export default withRouter(Competitions);

