import React from "react";
import { Link } from "react-router-dom";

import style from "../css/Header.module.css";

function PublicHeader(props) {
    return (
        <div className={style.header}>
            <span className={style.span}>OnlyProgly</span>
            <Link to="/registration">
                <button style={{ margin: "10px" }}>
                    Регистрация
                </button>
            </Link>
            <Link to="/login">
                <button style={{ margin: "10px" }}>
                    Вход
                </button>
            </Link>
        </div>
    );
}

export default PublicHeader;
