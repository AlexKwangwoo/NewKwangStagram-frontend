import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client";
import { faThemeco } from "@fortawesome/free-brands-svg-icons";
import {
  faHeart,
  faComment,
  faBoxes,
  faTh,
  faBorderAll,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import styled from "styled-components";
import Button2 from "../components/auth/Button2";
import PageTitle from "../components/PageTitle";
import { FatText } from "../components/shared";
import { PHOTO_FRAGMENT } from "../fragments";
import useUser, { ME_QUERY } from "../hooks/useUser";
import ModalScreenForProfile from "../components/ModalScreenForProfile";
import Modal from "react-awesome-modal";
import EditProfile from "./EditProfile";
import UploadPhoto from "./UploadPhoto";

const FOLLOW_USER_MUTATION = gql`
  mutation followUser($username: String!) {
    followUser(username: $username) {
      ok
    }
  }
`;

const UNFOLLOW_USER_MUTATION = gql`
  mutation unfollowUser($username: String!) {
    unfollowUser(username: $username) {
      ok
    }
  }
`;

const TOGGLE_LIKE_MUTATION = gql`
  mutation toggleLike($id: Int!) {
    toggleLike(id: $id) {
      ok
      error
    }
  }
`;

const SEE_PROFILE_QUERY = gql`
  query seeProfile($username: String!) {
    seeProfile(username: $username) {
      id
      # 아폴로 캐쉬 apollo,js 가서 확인하면 id 안써도됨
      firstName
      lastName
      username
      email
      bio
      avatar
      photos {
        id
        file
        likes
        commentNumber
        isLiked
        comments {
          id
          user {
            username
            avatar
          }
          payload
          isMine
          createdAt
        }
      }
      totalFollowing
      totalFollowers
      isMe
      followers {
        username
      }
      isFollowing
    }
  }
`;

const ISME_QUERY = gql`
  query me {
    me {
      id
      username
      avatar
      email
      following {
        username
        avatar
      }
      followers {
        username
        avatar
      }
    }
  }
`;

const ProfileContainer = styled.div`
  padding-top: 60px;
  margin-bottom: 80px;
`;
const Header = styled.div`
  display: flex;
  margin-bottom: 40px;
`;
const Avatar = styled.div`
  margin-left: 50px;
  height: 160px;
  width: 160px;
  border-radius: 50%;
  margin-right: 150px;
  background-image: url(${(props) => props.src});
  background-position: center;
  background-size: cover;
  /* background-color: #2c2c2c; */
`;
const Column = styled.div`
  width: 330px;
`;
const Username = styled.h3`
  font-size: 28px;
  font-weight: 400;
  margin-right: 40px;
`;
const Row = styled.div`
  margin-bottom: 20px;
  font-size: 16px;
  display: flex;
  align-items: center;
`;
const List = styled.ul`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;
const Item = styled.li`
  font-size: 15px;
`;
const Value = styled(FatText)`
  font-size: 15px;
`;
const Name = styled(FatText)`
  font-size: 15px;
  margin-bottom: -15px;
`;
const Grid = styled.div`
  display: grid;
  grid-auto-rows: 290px;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 50px;
`;
const Photo = styled.div`
  background-image: url(${(props) => props.bg});
  background-size: cover;
  position: relative;
  cursor: pointer;
`;
const Icons = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  opacity: 0;
  &:hover {
    opacity: 1;
  }
`;
const Icon = styled.span`
  font-size: 18px;
  display: flex;
  align-items: center;
  margin: 0px 5px;
  svg {
    font-size: 14px;
    margin-right: 5px;
  }
`;

const Line = styled.div`
  width: 100%;
  height: 0;
  border: 0.1px solid;
  border-color: #e5e5e5;
`;

const LineU = styled.div`
  width: 10%;
  margin: auto;
  height: 0;
  border: 0.1px solid;
  border-color: #6e6e6e;
`;

const LineT = styled.div`
  width: 10%;
  margin: auto;
  height: 0;
  border: 0.1px solid;
  border-color: #6e6e6e;
  margin-bottom: 10px;
`;

const Text = styled.p`
  font-weight: 600;
  font-size: 16px;
  margin: auto;
  text-align: center;
  margin-bottom: 40px;
`;

const PostText = styled.div`
  display: inline-block;
  margin-left: 5px;
`;

const FirstRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const LogoutBtn = styled.button`
  background-color: white;
  border: 1px solid #dfdfdf;
  color: #aaacaf;
  border-radius: 3px;
  font-size: 11px;
  padding: 5px 10px 5px 10px;
  cursor: pointer;
  margin-right: 10px;
  &:hover {
    background: #e5e5e5;
    color: black;
  }
`;

const ProfileBtn = styled(Button2).attrs({
  as: "span",
})`
  margin-left: 20px;
  cursor: pointer;
  padding: 10px 5px;
  font-size: 13px;
  &:hover {
    background: #006bb3;
  }
`;

const BioBox = styled.div`
  font-size: 13px;
  margin-top: 10px;
  color: gray;
`;

function Profile() {
  const [isLikedState, setIsLikedState] = useState();
  const [fileState, setFileState] = useState();
  const [photoIdState, setPhotoIdState] = useState();
  const [commentsState, setComentsState] = useState();

  const { username } = useParams();
  const { data: userData } = useUser();
  const [editVisible, setEditVisible] = useState(false);

  const client = useApolloClient();
  const location = useLocation();
  const { data, loading, refetch } = useQuery(SEE_PROFILE_QUERY, {
    variables: {
      username,
    },
  });

  const result = window.location;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (result.search === "?upload=true") {
      openUploadModal();
    }
  }, []);

  const updateToggleLike = (cache, result) => {
    //update가 되면 여기가 실행될것임.. 마치 onComplete처럼
    // console.log("실행됨");
    const {
      data: {
        toggleLike: { ok },
      },
    } = result;
    if (ok) {
      const photoId = `Photo:${photoIdState}`;
      // console.log("캐쉬내부", cache);
      // console.log("photoIdState", photoIdState);
      setIsLikedState(!isLikedState);
      cache.modify({
        id: photoId,
        fields: {
          isLiked(prev) {
            //prev 현재 isLiked의 불린값!
            //필드 이름을 똑같이 써주고 필드이름+(prev) 를통해 이전값을 조정가능!
            //무조건 같은 이름에 +(prev)를 써줘야한다!
            return !prev;
          },
          likes(prev) {
            //prev likes 갯수!
            if (isLikedState) {
              // 좋아했다면 한번누르면 반대는 -1
              return prev - 1;
            }
            return prev + 1;
          },
        },
      });
    }
  };

  const uploadPhotoBtn = () => {
    openUploadModal();
  };

  const [toggleLikeMutation] = useMutation(TOGGLE_LIKE_MUTATION, {
    // variables: {
    //   photoIdState,
    // },
    update: updateToggleLike,
    // refetchQueries
  });

  // console.log("profileData", data);

  const { data: isMeQueryData, loading: isMeQueryDataLoading } =
    useQuery(ISME_QUERY);

  // console.log("Profile", data);

  const unfollowUserUpdate = (cache, result) => {
    // 업데이트는 캐쉬를 가져올수있음!
    const {
      data: {
        unfollowUser: { ok },
      },
    } = result;
    if (!ok) {
      return;
    }
    cache.modify({
      id: `User:${username}`,
      fields: {
        isFollowing(prev) {
          return false;
        },
        totalFollowers(prev) {
          return prev - 1;
        },
      },
    });

    const { me } = userData;
    cache.modify({
      id: `User:${me?.username}`,
      fields: {
        totalFollowing(prev) {
          return prev - 1;
        },
      },
    });
  };

  const [unfollowUser] = useMutation(UNFOLLOW_USER_MUTATION, {
    variables: {
      username,
    },
    refetchQueries: [{ query: ISME_QUERY, variables: null }],
    update: unfollowUserUpdate,

    // refetchQueries: [{ query: SEE_PROFILE_QUERY, variables: { username } }],
    // 리페치 방법
  });

  const followUserCompleted = (data) => {
    const {
      followUser: { ok },
    } = data;
    if (!ok) {
      return;
    }
    const { cache } = client;
    cache.modify({
      id: `User:${username}`,
      fields: {
        isFollowing(prev) {
          return true;
        },
        totalFollowers(prev) {
          return prev + 1;
        },
      },
    });

    const { me } = userData;
    cache.modify({
      id: `User:${me?.username}`,
      fields: {
        totalFollowing(prev) {
          return prev + 1;
        },
      },
    });
  };

  const [followUser] = useMutation(FOLLOW_USER_MUTATION, {
    variables: {
      username,
    },
    refetchQueries: [{ query: ISME_QUERY, variables: null }],
    onCompleted: followUserCompleted,
  });

  // console.log("isMeQueryData", isMeQueryData);

  const getButton = (seeProfile) => {
    const { isMe, isFollowing, username } = seeProfile;
    if (isMe) {
      return (
        <ProfileBtn onClick={() => openEditModal()}>Edit Profile</ProfileBtn>
      );
    }
    if (
      isMeQueryData?.me?.following.filter(
        (following) => following.username === username
      ).length > 0
    ) {
      return <ProfileBtn onClick={unfollowUser}>Unfollow</ProfileBtn>;
    } else {
      return <ProfileBtn onClick={followUser}>Follow</ProfileBtn>;
    }
  };

  const Logout = () => {
    client.clearStore();
    localStorage.removeItem("TOKEN");
    window.location.assign("/");
  };

  const openEditModal = (photo) => {
    document.body.style.overflow = "hidden";
    // console.log("photo정보", photo);
    setEditVisible(true);
    // setIsLikedState(photo.isLiked);
    // setFileState(photo.file);
    // setPhotoIdState(photo.id);
    // setComentsState(photo.comments);
    // toggleLikeMutation({
    //   variables: { id: photoIdState },
    // });
  };
  const closeEditModal = () => {
    document.body.style.overflow = "unset";
    setEditVisible(false);
  };

  const [visible, setVisible] = useState(false);

  const openModal = (photo) => {
    document.body.style.overflow = "hidden";
    // console.log("photo정보", photo);
    setVisible(true);
    setIsLikedState(photo.isLiked);
    setFileState(photo.file);
    setPhotoIdState(photo.id);
    setComentsState(photo.comments);
    // toggleLikeMutation({
    //   variables: { id: photoIdState },
    // });
  };
  const closeModal = () => {
    document.body.style.overflow = "unset";
    setVisible(false);
  };

  const [uploadVisible, setUploadVisible] = useState(false);

  const openUploadModal = (photo) => {
    document.body.style.overflow = "hidden";

    setUploadVisible(true);
  };

  const closeUploadModal = () => {
    document.body.style.overflow = "unset";
    setUploadVisible(false);
  };

  return (
    <ProfileContainer>
      <PageTitle
        title={
          loading ? "Loading..." : `${data?.seeProfile?.username}'s Profile`
        }
      />
      <Header>
        <Avatar src={data?.seeProfile?.avatar} />
        <Column>
          <Row>
            <FirstRow>
              <Username>{data?.seeProfile?.username}</Username>
              {data?.seeProfile ? getButton(data.seeProfile) : null}
            </FirstRow>
          </Row>
          <Row>
            <List>
              <Item>
                <span>
                  <Value>{data?.seeProfile?.photos?.length}</Value> posts
                </span>
              </Item>
              <Item>
                <span>
                  <Value>{data?.seeProfile?.totalFollowers}</Value> followers
                </span>
              </Item>
              <Item>
                <span>
                  <Value>{data?.seeProfile?.totalFollowing}</Value> following
                </span>
              </Item>
            </List>
          </Row>
          <Row>
            <Name>
              {data?.seeProfile?.firstName}
              {data?.seeProfile?.lastName}
            </Name>
          </Row>
          <Row>
            <BioBox>{data?.seeProfile?.bio}</BioBox>
          </Row>
          {data?.seeProfile?.isMe && (
            <div>
              <LogoutBtn onClick={Logout}>Log out</LogoutBtn>
              <LogoutBtn onClick={() => uploadPhotoBtn()}>
                Upload Photo
              </LogoutBtn>
            </div>
          )}
        </Column>
      </Header>
      <LineU />
      <Line />
      <LineT />
      <Text>
        <FontAwesomeIcon icon={faBorderAll} size="md" />
        <PostText>POSTS</PostText>
      </Text>

      <Grid>
        {data?.seeProfile?.photos.map((photo) => (
          <Photo
            key={photo.id}
            bg={photo.file}
            onClick={() => openModal(photo)}
          >
            <Icons>
              <Icon>
                <FontAwesomeIcon icon={faHeart} />
                {photo.likes}
              </Icon>
              <Icon>
                <FontAwesomeIcon icon={faComment} />
                {photo.commentNumber}
              </Icon>
            </Icons>
          </Photo>
        ))}
      </Grid>
      <Modal
        visible={uploadVisible}
        width="350"
        height="230"
        effect="fadeInUp"
        onClickAway={() => closeUploadModal()}
      >
        <UploadPhoto refetch={refetch} closeUploadModal={closeUploadModal} />
      </Modal>

      <Modal
        visible={editVisible}
        width="350"
        height="550"
        effect="fadeInUp"
        onClickAway={() => closeEditModal()}
      >
        <EditProfile
          user={userData?.me}
          refetch={refetch}
          closeEditModal={closeEditModal}
        />
      </Modal>

      <Modal
        visible={visible}
        width="930"
        height="550"
        effect="fadeInUp"
        onClickAway={() => closeModal()}
      >
        <ModalScreenForProfile
          visible={visible}
          photoId={photoIdState}
          user={data?.seeProfile}
          file={fileState}
          comments={commentsState}
          isLiked={isLikedState}
          setComentsState={setComentsState}
          toggleLikeMutation={toggleLikeMutation}
        />
      </Modal>
    </ProfileContainer>
  );
}
export default Profile;
