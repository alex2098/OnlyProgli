import React, { Component } from "react";

import Header from "./components/Header";
import PublicHeader from "./components/PublicHeader";
import Menu from "./components/Menu";
import NamePage from "./components/NamePage";

import style from "./css/Home.module.css";

class Home extends Component {
    constructor(props) {
        super(props);
        this.path = document.location.pathname;
        if (this.path === "/home") {
            this.props.IsAuth();
        }
        this.text = `Веб-приложение для проведения соревнований между программируемыми
                    исполнителями.В данном веб - приложении пользователи могут создавать
                    соревнования, а уже в них они могут как создавать задачи, так их и
                    решать. Суть задачи в свою очередь состоит в том, чтобы запрограммировать
                    исполнителя, на то, чтобы собрать как можно больше предметов на игровом поле.
                    Также существуют турниры между двумя исполнителями, суть которых в том, чтобы
                    взять два случайных исполнител¤ с уже прописанной программой для них и поместить
                    на одно игровое поле.Суть таких турниров в том, чтобы собрать как можно больше
                    предметов на игровом поле, при условии, что на нем также находится другой исполнитель.`;
    }

    render() {
        if (this.path === "/home") {
            return (
                <div>
                    <Header />
                    <Menu />
                    <div className="main">
                        <NamePage name="Главная" />
                        <div className={style.div_1}>
                            {this.text}
                        </div>
                    </div>
                </div>
            );
        }
        else {
            return (
                <div>
                    <PublicHeader />
                    <div className={style.div_2} >
                        <NamePage name="Главная" />
                        <div className={style.div_1}>
                            {this.text}
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default Home;
