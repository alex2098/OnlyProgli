import React, { Component } from "react";
import Modal from "react-modal";

import Header from "./components/Header";
import Menu from "./components/Menu";
import NamePage from "./components/NamePage";

const host_name = "https://" + document.location.host;

Modal.setAppElement("#root");

class Support extends Component {
    constructor(props) {
        super(props);
        this.props.IsAuth();
        this.state = {
            text: "",
            is_open_modal: false
        };
    }

    onChangeSupport = event => this.setState({ text: event.target.value });
    closeModal = () => this.setState({ is_open_modal: false });

    onClickSupport = async () => {
        const is_auth = await this.props.IsAuth();
        if (!is_auth) {
            return;
        }

        const response = await fetch(`${host_name}/api/user/support`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                  "Authorization": "Bearer " + localStorage.getItem("user")
            },
            body: JSON.stringify(this.state.text)
        });
        if (response.ok) {
            this.setState({
                text: "",
                is_open_modal: true
            });
        }
    }

    render() {
        return (
            <div>
                <Header />
                <Menu />
                <div className="main_full">
                    <NamePage name="Техническая поддержка" />
                    <div className="main_elements">
                        <textarea style={{height: "100%"}}
                            value={this.state.text}
                            onChange={this.onChangeSupport} />
                    </div>
                    <div className="main_button">
                        <button onClick={this.onClickSupport}>
                            Отправить
                        </button>
                    </div>
                </div>
                <Modal isOpen={this.state.is_open_modal}
                    onRequestClose={this.closeModal}
                    className="Modal"
                    overlayClassName="Overlay">
                    <p>Письмо было отправлено </p>
                    <button onClick={this.closeModal}>
                        Ок
                    </button>
                </Modal>
            </div>
        );
    }
}

export default Support;
