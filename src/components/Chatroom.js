import React, { useState, useRef } from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { useAuth } from '../contexts/AuthContext'
import { firestore } from '../firebase'
import firebase from 'firebase/compat/app'

import ChatMessage from './ChatMessage'

function Chatroom(props) {
    const { currentUser } = useAuth()

    //Props
    const { chatroomId } = props

    //Messages collection - firestore
    const messageDatabase = firestore.collection('messages')
    const messageQuery = messageDatabase.orderBy("createdAt", "desc").where("chatroomId", "==", chatroomId)
    const [messages] = useCollectionData(messageQuery, {idField: 'id'})

    //State & Ref hooks
    const [msgFormValue, setMsgFormValue] = useState('')
    const [error, setError] = useState('')
    const scrollBottomRef = useRef()

    async function handleMessage(e) {
        e.preventDefault()
        if(msgFormValue === '') return
        const {uid, photoURL, displayName} = currentUser

        try {
            setError('')
            messageDatabase.add({
                text: msgFormValue,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                uid,
                photoURL,
                displayName,
                chatroomId
            })
        } catch(err) {
            console.log(err.message)
        }

        setMsgFormValue('')
        scrollBottomRef.current.scrollIntoView({behavior: 'smooth'})
    }

    return(
        <div className="message-component component">
            {error && <div>{error}</div>}
            <div className="message-header">
                <p>header</p>
                <div className="box-container">
                    <span className="box">
                        <span className="box-minus"></span>
                    </span>
                    <span className="box">
                        <span className="box-square"></span>
                    </span>
                    <span className="box">
                        <span className="box-x box-x-right"></span>
                        <span className="box-x box-x-left"></span>
                    </span>
                </div>
            </div>
            <div className="message-sub-header">
                <p className="message-sub-header-file">File</p>
                <p className="message-sub-header-edit">Edit</p>
                <p className="message-sub-header-insert">Insert</p>
            </div>
            <span className="message-sub-header-border"></span>
            <div className="message-container">
                {messages && messages.reverse().map(msg => <ChatMessage key={msg.id} message={msg} />)}
                <div ref={scrollBottomRef}></div>
            </div>
            <form className="message-form" onSubmit={handleMessage} >
                <input className="message-form--input" onKeyPress={(event) => {if(event.keyCode === '13') handleMessage()}} value={msgFormValue} onChange={(e) => setMsgFormValue(e.target.value)} type="text" />
                <div className="message-form-btns">
                    <div className="message-form-btns-1"></div>
                    <div className="message-form-btns-2"></div>
                    <div className="message-form-btns-3">
                        <button className="message-form--submit" type="submit">Send</button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Chatroom
