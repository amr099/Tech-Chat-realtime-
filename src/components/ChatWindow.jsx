import React, { useContext } from "react";
import Messages from "components/Messages";
import SendMessage from "components/SendMessage";
import styled from "styled-components";
import { RoomContext } from "context/RoomContext";
import { UsersContext } from "context/UsersContext";

const Header = styled.div`
    height: 9vh;
    background-color: #fdfdfd;
    border-bottom: 3px solid #f4f4f4;
    text-align: center;
    padding: 10px 0;
`;

const I = styled.i`
    position: relative;
    left: 47%;
    font-size: 2rem;
`;

const H2 = styled.h2`
    margin: 0;
`;

const UserImg = styled.img`
    width: 20px;
    height: 20px;
    border-radius: 50%;
`;

const Owner = styled.div`
    width: fit-content;
    margin: auto;
    margin-top: 5px;
    display: flex;
    gap: 5px;
    align-items: center;
    font-weight: bold;
    font-size: 0.8rem;
`;

const Status = styled.div`
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: ${(props) =>
        props.status === "online" ? "green" : "red"};
`;

export default function ChatWindow({ membersCon, setMembersCon }) {
    const { room } = useContext(RoomContext);
    const { users } = useContext(UsersContext);
    return (
        room && (
            <>
                <Header>
                    <H2>{room?.name}</H2>
                    {(() => {
                        for (let i in users) {
                            if (users[i].id === room.creatorId) {
                                return (
                                    <Owner>
                                        <UserImg src={users[i].img}></UserImg>
                                        <span>{users[i].name}</span>
                                        <Status
                                            status={users[i].status}
                                        ></Status>
                                    </Owner>
                                );
                            }
                        }
                    })()}
                    <I
                        className={
                            membersCon ? "bi bi-people-fill" : "bi bi-people"
                        }
                        onClick={() => {
                            setMembersCon(!membersCon);
                        }}
                    ></I>
                </Header>
                <Messages />
                <SendMessage />
            </>
        )
    );
}
