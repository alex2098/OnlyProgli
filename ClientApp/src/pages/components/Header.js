import React from "react";
import { Link } from "react-router-dom";
import ReactTooltip from "react-tooltip";

import exit from "../resources/exit.png"
import settings from "../resources/settings.png"
import write_to_admin from "../resources/write_to_admin.png"

import style from "../css/Header.module.css";

const host_name = "https://" + document.location.host;

function TooltipHeader(props) {
    return (
        <Link className={style.link} to={{ pathname: props.to }}>
            <img className={style.img}
                data-tip={props.text}
                data-for={props.to}
                src={props.src}
                onClick={props.onClick} />
            <ReactTooltip id={props.to}
                type="dark"
                place="bottom"
                multiline={true}/>
        </Link>
    );
}

function Header(props) {
    const path = document.location.pathname;

    const onClickExit = () => {
        fetch(`${host_name}/api/user/exit`, {
            method: "DELETE",
            headers: {"Authorization": "Bearer " + localStorage.getItem("user")}});
        localStorage.clear();
        sessionStorage.clear();
    }

    return (
        <div className={style.header}>
            <span className={style.span}>OnlyProgly</span>
            {path === "/support" ||
                <TooltipHeader to="/support"
                    src={write_to_admin}
                    text="техническая<br />поддержка" />}
            {path === "/user/settings" ||
                <TooltipHeader to="/user/settings"
                    src={settings}
                    text="Настройки" />}
            <TooltipHeader to="/user/settings"
                src={exit}
                text="Выход"
                onClick={onClickExit} />
        </div>
    );
}

export default Header;
