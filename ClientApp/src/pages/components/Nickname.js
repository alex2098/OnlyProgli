import React from "react";

function Nickname(props) {
    const onCheckNickname = () => {
        if ((props.nickname.length <= 32 && props.nickname.length >= 4) || props.nickname.length === 0) {
            props.UpdateNicknameLabel("Имя");
            props.UpdateNicknameStyle("input_current");
        }
        else {
            props.UpdateNicknameLabel("Имя должно быть длиной от 4 до 32 символов!");
            props.UpdateNicknameStyle("input_error");
        }
    };

    return (
        <div>
            <span className={props.style}>{props.label}</span>
            <br />
            <input className={props.style}
                type="text"
                placeholder="nickname"
                value={props.nickname}
                onChange={props.onChangeNickname}
                onBlur={onCheckNickname} />
          
        </div>
    );
}

export default Nickname;
