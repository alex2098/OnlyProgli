import React from "react";

import style from "../css/LoadingPage.module.css";

function LoadingPage(props) {
    return (
        <div className={style.loading_page}>
            <div className={[style.ball, style.ball_1].join(' ')}>
                <div className={style.inner_ball}></div>
            </div>
            <div className={[style.ball, style.ball_2].join(' ')}>
                <div className={style.inner_ball}></div>
            </div>
            <div className={[style.ball, style.ball_3].join(' ')}>
                <div className={style.inner_ball}></div>
            </div>
            <div className={[style.ball, style.ball_4].join(' ')}>
                <div className={style.inner_ball}></div>
            </div>
            <div className={[style.ball, style.ball_5].join(' ')}>
                <div className={style.inner_ball}></div>
            </div>
        </div>
    );
}

export default LoadingPage;