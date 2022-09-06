import React, { Component } from "react";
import { Route, Switch, withRouter } from "react-router";

import Animation from "./pages/Animation";
import Competitions from "./pages/Competitions";
import CreateCompetition from "./pages/CreateCompetition";
import CreateTask from "./pages/CreateTask";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Recovery from "./pages/Recovery";
import Registration from "./pages/Registration";
import CompetitionResult from "./pages/CompetitionResult";
import TaskResult from "./pages/TaskResult";
import SolutionTask from "./pages/SolutionTask";
import Tasks from "./pages/Tasks";
import CompetitionSettings from "./pages/CompetitionSettings";
import TaskSettings from "./pages/TaskSettings";
import UserSettings from "./pages/UserSettings";
import UserCompetitions from "./pages/UserCompetitions";
import Support from "./pages/Support";

import LoadingPage from "./pages/components/LoadingPage";

import "./pages/css/App.css";
import "./pages/css/Input.css";
import "./pages/css/CellsInField.css";
import "./pages/css/Comand.css";

const host_name = "https://" + document.location.host;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            is_check_auth: false,
            time_end_token: undefined,
            is_auth: null
        };
    }

    UpdateTimeEndToken = value => this.setState({
        time_end_toke: value,
        is_auth: true
    });

    CheckRedirection = value => {
        const path = document.location.pathname;
        if (!value && !(path === "/" || path === "/login" || path === "/recovery" || path === "/registration")) {
            this.props.history.push("/");
        }
        if (value && (path === "/" || path === "/login" || path === "/recovery" || path === "/registration")) {
            this.props.history.push("/home");
        }
    }

    CheckAuth = async () => {
        const token = localStorage.getItem("user");
        if (token === null || token.length === 0) {
            return false;
        }
        if (Date.parse(this.state.time_end_token) > Date.parse(new Date())) {
            return true;
        }

        const response = await fetch(`${host_name}/api/user/refresh`, {
            method: "PUT",
            headers: { "Content-Type": "application/json;charset=utf-8" },
            body: JSON.stringify({ token: token })
        });
        if (response.ok) {
            const result = await response.json();
            localStorage.setItem("user", result.value.token);
            this.setState({ time_end_token: result.value.date });
            return true;
        }
        return false;
    }

    IsAuth = async () => {
        const is_auth = await this.CheckAuth();
        if (!is_auth) {
            localStorage.clear();
            sessionStorage.clear();
            this.setState({ is_auth: false });
            this.props.history.push("/");
        }
        return is_auth;
    }

    async componentDidMount() {
        const is_auth = await this.CheckAuth();
        this.CheckRedirection(is_auth);
        this.setState({
            is_check_auth: true,
            is_auth: is_auth
        });
    }

    componentDidUpdate() {
        if (this.state.is_auth !== null) {
            this.CheckRedirection(this.state.is_auth);
        }
    }

    render() {
        if (this.state.is_check_auth) {
            return (
                <div className="background_app">
                    <Switch>
                        <Route exact path="/">
                            <Home />
                        </Route>
                        <Route exact path="/home">
                            <Home IsAuth={this.IsAuth} />
                        </Route>
                        <Route path="/login">
                            <Login UpdateTimeEndToken={this.UpdateTimeEndToken} />
                        </Route>
                        <Route path="/registration">
                            <Registration UpdateTimeEndToken={this.UpdateTimeEndToken} />
                        </Route>
                        <Route path="/recovery">
                            <Recovery UpdateTimeEndToken={this.UpdateTimeEndToken} />
                        </Route>
                        <Route path="/duel/:duel_id">
                            <Animation IsAuth={this.IsAuth} />
                        </Route>
                        <Route path="/task/:task_id/solution">
                            <SolutionTask IsAuth={this.IsAuth} />
                        </Route>
                        <Route path="/competitions/:page&:name&:begin&:end">
                            <Competitions IsAuth={this.IsAuth} />
                        </Route>
                        <Route path="/competition/create">
                            <CreateCompetition IsAuth={this.IsAuth} />
                        </Route>
                        <Route path="/task/create">
                            <CreateTask IsAuth={this.IsAuth} />
                        </Route>
                        <Route path="/competition/:competition_id/result">
                            <CompetitionResult IsAuth={this.IsAuth} />
                        </Route>
                        <Route path="/task/:task_id/result">
                            <TaskResult IsAuth={this.IsAuth} />
                        </Route>
                        <Route path="/competition/:competition_id/settings">
                            <CompetitionSettings IsAuth={this.IsAuth} />
                        </Route>
                        <Route path="/competition/:competition_id/:page&:name&:begin&:end">
                            <Tasks IsAuth={this.IsAuth} />
                        </Route>
                        <Route path="/task/:task_id/settings">
                            <TaskSettings IsAuth={this.IsAuth} />
                        </Route>
                        <Route path="/user/settings">
                            <UserSettings IsAuth={this.IsAuth}
                                UpdateTimeEndToken={this.UpdateTimeEndToken} />
                        </Route>
                        <Route path="/user/competitions/:page&:name&:begin&:end">
                            <UserCompetitions IsAuth={this.IsAuth} />
                        </Route>
                        <Route path="/support">
                            <Support IsAuth={this.IsAuth} />
                        </Route>
                        <Route path="*">
                            <div className="div_page_error">
                                <h1>Такой страницы не существует</h1>
                            </div>
                        </Route>
                    </Switch>
                </div>
            );
        }
        else {
            return (
                <div className="background_app">
                    <LoadingPage />
                </div>
            );
        }
    }
}

export default withRouter(App);
