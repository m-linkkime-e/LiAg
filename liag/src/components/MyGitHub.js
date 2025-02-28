import React, {Component} from "react";

class MyGitHub extends Component {

    render() {
        return (
            <div className="unselectable">
                {/* eslint-disable-next-line react/jsx-no-target-blank */}
                <a href="https://github.com/Great-Li-Xin/LiAg" target="_blank">
                    <img width="149" height="149"
                         src="https://github.blog/wp-content/uploads/2008/12/forkme_left_gray_6d6d6d.png?resize=149%2C149"
                         className="attachment-full size-full" alt="Fork me on GitHub"
                         data-recalc-dims="1"/>
                </a>
            </div>
        );
    }
}

export default MyGitHub;
