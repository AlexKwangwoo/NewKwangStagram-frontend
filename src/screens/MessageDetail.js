import { gql, useMutation, useQuery } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import React, { useState, useEffect, useRef } from "react";
import useUser from "../hooks/useUser";
import {
  faEdit,
  faPen,
  faQuestionCircle as faQuestionCircleSolid,
} from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "../utils";
import {
  faPaperPlane,
  faInfoCircle,
  faQuestionCircle,
} from "@fortawesome/free-regular-svg-icons";
import Button2 from "../components/auth/Button2";
import { Scrollbars } from "react-custom-scrollbars";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

const SEND_MESSAGE_MUTATION = gql`
  mutation sendMessage($payload: String!, $roomId: Int, $userId: Int) {
    sendMessage(payload: $payload, roomId: $roomId, userId: $userId) {
      ok
      id
    }
  }
`;

const SEE_ROOM_QUERY = gql`
  query seeRoom($id: Int!) {
    seeRoom(id: $id) {
      id
      updatedAt
      createdAt
      users {
        id
        username
        avatar
        email
      }
      messages {
        id
        payload
        user {
          id
          username
          avatar
        }
      }
    }
  }
`;

const ROOM_UPDATES = gql`
  subscription roomUpdates($id: Int!) {
    roomUpdates(id: $id) {
      id
      payload
      user {
        username
        avatar
      }
      read
    }
  }
`;
const MainBox = styled.div`
  width: 100%;
  height: 100%;
`;
const MessageDetailContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const RightTop = styled.div`
  width: 100%;
  height: 60px;
  font-size: 17px;
  font-weight: 600;
  display: flex;
  align-items: center;
  /* justify-content: center; */
  /* background-color: black; */
  border-bottom: 1px #e3e3e3 solid;

  justify-content: space-between;
`;

const CircleAvatar = styled.div`
  width: 25px;
  height: 25px;
  margin-right: 10px;
  border-radius: 50px;
  background-image: url(${(props) => props.src});
  background-size: cover;
  background-position: center;
`;

const UserInfo = styled.div`
  width: 100%;
  margin-left: 20px;
  display: flex;
  align-items: center;
`;

const Icon = styled.div`
  cursor: pointer;
  margin-right: 20px;
`;

const UserName = styled.div``;

const RightBottom = styled.div`
  width: 100%;
  /* padding-left: 20px; */
  padding-top: 15px;
  padding-bottom: 2px;
  height: calc(100% - 160px);
  overflow-x: hidden;
  /* background-color: blue; */
`;

const RightInput = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100px;
  /* width: 100%; */
  /* background-color: yellow; */
`;

const EachMessageContainer = styled.div`
  padding-right: 20px;
  margin-left: 20px;
  margin-top: 20px;
  display: flex;
  align-items: flex-end;
  /* background-color: blue; */
`;

const MessagePayLoadLeft = styled.div`
  height: 100%;
  max-width: 45%;
  font-size: 13px;
  padding: 15px 20px;
  border: 1px solid #f1f1f1;
  border-radius: 40px;
`;

const MessagePayLoadLeftLetter = styled.div`
  overflow-wrap: break-word;
  /* max-width: 200px; */
  width: 100%;
  /* background-color: red; */
`;

const MessagePayLoadRight = styled.p`
  margin-left: auto;
  max-width: 45%;
  font-size: 13px;
  padding: 15px 20px;
  /* border: 1px solid #f1f1f1; */
  background-color: #f1f1f1;
  border-radius: 40px;
  /* display: ; */
`;

const PostCommentInput = styled.input`
  width: 540px;
  height: 40px;
  padding-left: 20px;
  /* background-color: red; */
  border: 1px solid #dadada;
  border-radius: 20px;
  &::placeholder {
    font-size: 12px;
  }
`;

const DetailTitle = styled.div`
  margin-left: 270px;
`;

const SendButton = styled.div``;

const MembersContainer = styled.div`
  padding-bottom: 20px;
  /* background-color: red; */
`;

const CircleAvatarIndetail = styled.div`
  width: 60px;
  height: 60px;
  margin-right: 10px;
  border-radius: 50px;
  background-image: url(${(props) => props.src});
  background-size: cover;
  background-position: center;
`;

const UserInfoInDetail = styled.div``;

const MessageUserName = styled.div`
  margin-bottom: 2px;
  font-weight: 600;
`;

const MessageUserEmail = styled.div`
  margin-top: 4px;
  font-weight: 400;
  color: gray;
`;

const MemberLetter = styled.div`
  font-size: 16px;
  font-weight: 700;
  padding: 15px;
`;

const EachMemberContainer = styled.div`
  padding: 10px 0px 10px 15px;
  display: flex;
  align-items: center;
  &:hover {
    background-color: #f7f7f7;
  }
`;

const RoomInfo = styled.div`
  padding: 15px;
  width: 100%;
  height: 200px;
  /* background-color: blue; */
  border-top: 1px #e3e3e3 solid;
`;
const MessageCount = styled.div`
  color: gray;
  margin-bottom: 10px;
`;
const RoomCreated = styled.div`
  margin-bottom: 10px;
  color: gray;
`;
const PeopleCount = styled.div`
  margin-bottom: 10px;
  color: gray;
`;

const RoomInfoLetter = styled.span`
  color: gray;
  font-weight: 700;
  margin-right: 5px;
`;

const RoomLetter = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 15px;
`;

const ScrollBottom = styled.div`
  width: 0;
  height: 0;
  overflow-y: hidden;
  overflow-x: hidden;
`;

const ScrollContainer = styled.div`
  /* background-color: red; */
  overflow-x: hidden;
`;

const ScrollbarRemover = styled.div`
  z-index: 10;
  margin-top: -56px;
  width: 100%;
  height: 40px;
  background-color: white;
`;

const renderThumb = ({ style, ...props }) => {
  const thumbStyle = {
    borderRadius: 6,
    backgroundColor: "rgba(35, 49, 86, 0.8)",
    overflowX: "hidden",
  };
  return <div style={{ ...style, ...thumbStyle }} {...props} />;
};

const renderThumbHori = ({ style, ...props }) => {
  const thumbStyle = {
    overflowX: "hidden",
  };
  return <div style={{ ...style, ...thumbStyle }} {...props} />;
};

const CustomScrollbars = (props) => (
  <Scrollbars
    renderThumbHorizontal={renderThumbHori}
    renderThumbVertical={renderThumb}
    {...props}
  />
);

function MessageDetail({
  room,
  userData,
  SEE_ROOMS_QUERY,
  selectedDetail,
  clickDetailRemove,
  clickDetail,
}) {
  const [messageRoom, setMessageRoom] = useState();
  const { register, handleSubmit, setValue, getValues, watch } = useForm();
  const {
    data: seeRoomQuery,
    subscribeToMore,
    refetch,
    loading,
  } = useQuery(SEE_ROOM_QUERY, {
    variables: { id: room?.id },
  });
  // console.log("seeroomquery", seeRoomQuery);
  const messagesEndRef = React.createRef();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [seeRoomQuery]);

  const updateQuery = (prevQuery, options) => {
    //prevQuery??? ????????????.. ????????? ?????????..???????????? ???????????? ??????!
    // console.log("?????????????");
    refetch();
  };

  useEffect(() => {
    // console.log("?????????????????? ??????");
    if (seeRoomQuery?.seeRoom) {
      // console.log("???????????? ?????????", data.seeRoom);
      // ????????? ??????????????? ???????????? ?????????!
      subscribeToMore({
        //ROOM_QUERY ????????? ???????????? data??? ????????? ???????????????!
        document: ROOM_UPDATES,
        variables: {
          id: room?.id,
        },
        updateQuery,
        //updateQuery ??? ?????? ???????????? ????????? ??????????????? ????????? ???????????? ?????????!
      });
      // refetch();
      //????????? ?????? ?????? ????????? subscribe??? ???????????????!!
    }
  }, [seeRoomQuery?.seeRoom, subscribeToMore]);

  // console.log("??????????????????", seeRoomQuery);

  const updateSendMessage = (cache, result) => {
    console.log("result????????? ?????????????", result);
    const {
      data: {
        sendMessage: { ok, id },
      },
    } = result;
  };

  const [sendMessageMutation, { loading: sendingMessage }] = useMutation(
    SEND_MESSAGE_MUTATION,
    {
      refetchQueries: [{ query: SEE_ROOM_QUERY, variables: { id: room?.id } }],
      // update: updateSendMessage,
      //?????????????????????????????????!!
    }
  );

  // const selectMessageRoom = (room) => {
  //   setMessageRoom(room);
  // };

  const onValid = (data) => {
    console.log("?????????data", data);
    if (!sendingMessage) {
      // ???????????? ???????????? ???????????? ?????????!!
      sendMessageMutation({
        variables: {
          payload: data.payload,
          roomId: room?.id,
        },
      });
      setValue("payload", "");
    }
  };
  return (
    <MainBox>
      {selectedDetail.id !== undefined ? (
        <MessageDetailContainer>
          {" "}
          <RightTop>
            <DetailTitle>Details</DetailTitle>
            <Icon onClick={() => clickDetailRemove()}>
              <FontAwesomeIcon icon={faQuestionCircleSolid} size="lg" />
            </Icon>
          </RightTop>
          <RightBottom>
            <MemberLetter>Members</MemberLetter>
            <MembersContainer>
              {seeRoomQuery?.seeRoom?.users.map((user) => (
                <Link to={`/users/${user?.username}`} key={user.id}>
                  <EachMemberContainer>
                    <CircleAvatarIndetail
                      src={user.avatar}
                    ></CircleAvatarIndetail>
                    <UserInfoInDetail>
                      <MessageUserName>{user.username}</MessageUserName>
                      <MessageUserEmail>{user.email}</MessageUserEmail>
                    </UserInfoInDetail>
                  </EachMemberContainer>
                </Link>
              ))}
            </MembersContainer>
            <RoomInfo>
              <RoomLetter>Room Infomation</RoomLetter>
              <MessageCount>
                <RoomInfoLetter>Number of messages:</RoomInfoLetter>{" "}
                {seeRoomQuery?.seeRoom?.messages?.length}
              </MessageCount>
              <PeopleCount>
                {" "}
                <RoomInfoLetter>Number of people:</RoomInfoLetter>{" "}
                {seeRoomQuery?.seeRoom?.users?.length}
              </PeopleCount>
              <RoomCreated>
                {" "}
                <RoomInfoLetter>Room Created:</RoomInfoLetter>
                {formatDate(seeRoomQuery?.seeRoom?.createdAt)}
              </RoomCreated>
            </RoomInfo>
          </RightBottom>
        </MessageDetailContainer>
      ) : (
        <MessageDetailContainer>
          <RightTop>
            {seeRoomQuery?.seeRoom?.users[0].username ===
            userData?.me?.username ? (
              <UserInfo>
                <CircleAvatar
                  src={seeRoomQuery?.seeRoom?.users[1].avatar}
                ></CircleAvatar>
                <UserName>{seeRoomQuery?.seeRoom?.users[1].username}</UserName>
              </UserInfo>
            ) : (
              <UserInfo>
                <CircleAvatar
                  src={seeRoomQuery?.seeRoom?.users[0].avatar}
                ></CircleAvatar>
                <UserName>{seeRoomQuery?.seeRoom?.users[0].username}</UserName>
              </UserInfo>
            )}
            {seeRoomQuery?.seeRoom?.users[0].username ===
            userData?.me?.username ? (
              <Icon
                onClick={() => clickDetail(seeRoomQuery?.seeRoom?.users[1])}
              >
                <FontAwesomeIcon icon={faQuestionCircle} size="lg" />
              </Icon>
            ) : (
              <Icon
                onClick={() => clickDetail(seeRoomQuery?.seeRoom?.users[0])}
              >
                <FontAwesomeIcon icon={faQuestionCircle} size="lg" />
              </Icon>
            )}
          </RightTop>
          <RightBottom>
            <CustomScrollbars
              style={{ width: "100%", height: "100%" }}
              autoHide
              autoHideTimeout={500}
              autoHideDuration={200}
            >
              <ScrollContainer>
                {seeRoomQuery?.seeRoom?.messages.map((message) => (
                  <div key={message.id}>
                    {message?.user?.username !== userData?.me?.username ? (
                      <EachMessageContainer>
                        <CircleAvatar src={message.user.avatar} />
                        <MessagePayLoadLeft>
                          <MessagePayLoadLeftLetter>
                            {message.payload}
                          </MessagePayLoadLeftLetter>
                        </MessagePayLoadLeft>
                      </EachMessageContainer>
                    ) : (
                      <EachMessageContainer>
                        <MessagePayLoadRight>
                          <MessagePayLoadLeftLetter>
                            {message.payload}
                          </MessagePayLoadLeftLetter>
                        </MessagePayLoadRight>
                        {/* <CircleAvatar src={message.user.avatar} /> */}
                      </EachMessageContainer>
                    )}
                    <ScrollBottom ref={messagesEndRef} />
                  </div>
                ))}
              </ScrollContainer>
            </CustomScrollbars>
          </RightBottom>
          <RightInput>
            <ScrollbarRemover></ScrollbarRemover>
            <form onSubmit={handleSubmit(onValid)}>
              {" "}
              <PostCommentInput
                name="payload"
                ref={register({ required: true })}
                type="text"
                placeholder="Message..."
              />
              {/* <SendButton
            disabled={!Boolean(watch("messapayloadge"))}
            //???????????? ?????????(undefined or null) ????????? ????????? ?????????!!
          >
            <Icon>
              <FontAwesomeIcon icon={faInfoCircle} size="lg" />
            </Icon>
          </SendButton> */}
            </form>
          </RightInput>
        </MessageDetailContainer>
      )}
    </MainBox>
  );
}

export default MessageDetail;
