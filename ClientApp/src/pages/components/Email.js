import React from "react";

function Email(props)
{  
    const onCheckEmail = () => {
       const re_email = /^[\wа-яА-Я]{1}[\w-\.а-яА-Я]*@[\w-]+\.[a-z]{2,4}$/i;
       if (re_email.test(props.email) || props.email.length === 0) {
           props.UpdateEmailLabel("Электронная почта");
           props.UpdateEmailStyle("input_current");
       }
       else {
           props.UpdateEmailLabel("Электронная почта введена некорректно!");
           props.UpdateEmailStyle("input_error");
        }
    };

    return (
        <div>
            <span className={props.style}>{props.label}</span>
            <br />
            <input className={props.style}
                type="text"
                value={props.email}
                placeholder="email@email.com"
                onChange={props.onChangeEmail}
                onBlur={onCheckEmail} />
        </div>
    );
}

export default Email;
