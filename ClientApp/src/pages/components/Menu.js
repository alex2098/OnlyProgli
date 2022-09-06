import React from "react";
import { Link } from "react-router-dom";

import style from "../css/Menu.module.css";

function Menu(props) {
    const path = document.location.pathname;
    const content_id = sessionStorage.getItem("competition");
    const author = sessionStorage.getItem("author");
    return (
        <div className={style.div}>
            <p className={style.text}>Меню</p>
            <ul className={style.menu}>
                {path === "/home" ||
                <Link className={style.link} to="/home">
                    <li>Главная</li>
                </Link>}
                {path.includes("/competitions") ||
                <Link className={style.link} to="/competitions/0&name=&0&0">
                    <li>Соревнования</li>
                </Link>}
                {path.includes("/user/competitions") ||
                <Link className={style.link} to="/user/competitions/0&name=&0&0">
                    <li>Мои соревнования</li>
                </Link>}
                {path === "/competition/create" ||
                <Link className={style.link} to="/competition/create">
                    <li>Создать соревнование</li>
                </Link>}
                {content_id === null || path.includes(`/competition/${content_id}`) ||
                <Link className={style.link} to={`/competition/${content_id}/0&name=&0&0`}>
                    <li>Задачи</li>
                </Link>}
                {author === null || path === "/task/create" ||
                <Link className={style.link} to="/task/create">
                    <li>Создать задачу</li>
                </Link>}
                {content_id === null || path === `/competition/${content_id}/result` ||
                    <Link className={style.link} to={`/competition/${content_id}/result`}>
                        <li>Общие результаты</li>
                    </Link>}
            </ul>
        </div>
    );
}

export default Menu;
