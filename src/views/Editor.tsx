import React from 'react'

const Editor = () => {
    return (
        <React.Fragment>
            <div className="editor">
                <div className="editor__container">
                    <div className="editor__container__title">
                        <h1>Editor</h1>
                    </div>
                    <div className="editor__container__content">
                        <textarea className="editor__container__content__textarea" placeholder="Write your code here..." />
                    </div>
                </div>
            </div>
        </React.Fragment>
    )   
}

export default Editor