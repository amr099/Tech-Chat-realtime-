import React, { useContext } from "react";
import { ref, set, update, push, child } from "firebase/database";
import { db, firestoreDb } from "../../firebase-config";
import { AuthContext } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import { setDoc, doc } from "firebase/firestore";
import { RoomsContext } from "context/RoomsContext";

const Container = styled.div`
    display: flex;
    border-bottom: 1px solid #909090;
    margin-bottom: 2rem;
    &::focued {
        outline: none;
    }
`;

const Input = styled.input`
    all: unset;
    font-size: 1.2rem;
    padding: 1rem;
    background-color: inherit;
    width: 100%;
    &::placeholder {
        color: #cacaca;
    }
`;

const I = styled.i`
    font-size: 3rem;
`;

export default function CreateRoom({}) {
    const { register, handleSubmit } = useForm();
    const { userData } = useContext(AuthContext);
    const { rooms } = useContext(RoomsContext);
    function onSubmit(data) {
        if (userData) {
            if (!rooms.find((r) => r.name === data.roomName)) {
                try {
                    const roomId = uuid();
                    try {
                        // Set new record into rooms collection.
                        setDoc(doc(firestoreDb, "Rooms", roomId), {
                            id: roomId,
                            name: data.roomName,
                            creatorName: userData.name,
                            creatorId: userData.id,
                        });
                    } catch (e) {
                        console.log(e);
                        console.log(
                            "error setting new room into rooms collection"
                        );
                    }

                    try {
                        // Set new record for newly created room into rooms object .
                        set(ref(db, `rooms/${data.roomName}/`), {
                            members: {
                                Owner: {
                                    id: userData.id,
                                    name: userData.name,
                                    memberImg: userData.img,
                                    status: "owner",
                                },
                            },
                        });
                    } catch (e) {
                        console.log(e);
                        console.log(
                            "error setting new room into messages collection"
                        );
                    }

                    try {
                        // Add new room into creator rooms.
                        const newRoomKey = push(
                            child(ref(db), `users/${userData.id}/rooms`)
                        ).key;
                        const updates = {};
                        updates[`users/${userData.id}/rooms/${roomId}`] = {
                            id: roomId,
                            name: data.roomName,
                            status: "owner",
                        };
                        return update(ref(db), updates);
                    } catch (e) {
                        console.log(e);
                        console.log(
                            "error adding new room into creator's rooms"
                        );
                    }

                    try {
                        // Set new record for newly created room into messages object.
                        set(ref(db, "messages/" + data.roomName), {
                            creationMsg: {
                                userId: userData.id,
                                userName: userData.name,
                                userImg: userData.img,
                                msg: `${userData.name} has created '${data.roomName}' successfully.`,
                                time: new Date().toLocaleString(),
                            },
                        });
                    } catch (e) {
                        console.log(e);
                        console.log(
                            "error setting new room into messages collection"
                        );
                    }

                    try {
                        // Add new note into creator notifications.
                        const newNoteKey = push(
                            child(ref(db), `users/${userData.id}/notifications`)
                        ).key;
                        const updates = {};
                        updates[
                            `users/${userData.id}/notifications/${newNoteKey}`
                        ] = {
                            note: `You have created '${
                                data.roomName
                            }' room successfully at ${new Date().toLocaleDateString()} `,
                        };
                        return update(ref(db), updates);
                    } catch (e) {
                        console.log(e);
                        console.log(
                            "error adding new room into creator's rooms"
                        );
                    }
                } catch (e) {
                    console.log(e);
                }
            } else {
                alert("this room name is already used.");
            }
        } else {
            alert("You have to log in first.");
        }
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Container>
                <Input
                    {...register("roomName")}
                    placeholder='Create new room ...'
                />
                <button type='submit'>
                    <I className='bi bi-plus'></I>
                </button>
            </Container>
        </form>
    );
}

// Create Room Proccess :
//  - You should be logged in
//  - can't create room with repeated name.
//  - if room entered :
//      - set new record into rooms object has (id,name,creatorName,creatorId)
//      - update members to contain creator.
//      - set record into messages object has creationMessage
//      - set record into user's rooms has room's info.
