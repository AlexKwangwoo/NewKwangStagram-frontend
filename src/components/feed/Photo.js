import { gql, useMutation } from "@apollo/client";
import {
  faBookmark,
  faComment,
  faPaperPlane,
  faHeart,
} from "@fortawesome/free-regular-svg-icons";
import { faHeart as SolidHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import styled from "styled-components";
import Avatar from "../Avatar";
import { FatText } from "../shared";
import Comments from "./Comments";
import { Link } from "react-router-dom";
import { useState } from "react";
import useUser from "../../hooks/useUser";
import ModalScreen from "../ModalScreen";
import Modal from "react-awesome-modal";

const TOGGLE_LIKE_MUTATION = gql`
  mutation toggleLike($id: Int!) {
    toggleLike(id: $id) {
      ok
      error
    }
  }
`;

const PhotoContainer = styled.div`
  background-color: white;
  border-radius: 4px;
  border: 1px solid ${(props) => props.theme.borderColor};
  margin-bottom: 60px;
  max-width: 615px;
`;
const PhotoHeader = styled.div`
  padding: 10px 12px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgb(239, 239, 239);
`;

const Username = styled(FatText)`
  margin-left: 15px;
`;

const PhotoFile = styled.div`
  width: 610px;
  height: 610px;
  min-width: 100%;
  max-width: 610px;
  max-height: 610px;
  background-color: white;
  background-image: url(${(props) => props.src});
  background-size: cover;
  background-position: center;
`;

const PhotoDataWrapper = styled.div`
  width: 100%;
`;

const PhotoData = styled.div`
  padding: 12px 15px;
`;

const PhotoActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  div {
    display: flex;
    align-items: center;
  }
  svg {
    font-size: 20px;
  }
`;

const PhotoAction = styled.div`
  margin-right: 10px;
  cursor: pointer;
`;

const Likes = styled(FatText)`
  margin-top: 15px;
  display: block;
`;

const CircleAvatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50px;
  background-image: url(${(props) => props.src});
  background-size: cover;
  background-position: center;
`;

const CircleAvatarBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  width: 40px;
  height: 40px;
  border: 2px solid #c42d91;
  border-radius: 50px;
`;

function Photo({
  id,
  user,
  file,
  isLiked,
  likes,
  caption,
  commentNumber,
  comments,
}) {
  const { data: userData } = useUser();
  const updateToggleLike = (cache, result) => {
    //update??? ?????? ????????? ???????????????.. ?????? onComplete??????
    const {
      data: {
        toggleLike: { ok },
      },
    } = result;
    if (ok) {
      const photoId = `Photo:${id}`;
      cache.modify({
        id: photoId,
        fields: {
          isLiked(prev) {
            //prev ?????? isLiked??? ?????????!
            //?????? ????????? ????????? ????????? ????????????+(prev) ????????? ???????????? ????????????!
            //????????? ?????? ????????? +(prev)??? ???????????????!
            return !prev;
          },
          likes(prev) {
            //prev likes ??????!
            if (isLiked) {
              // ??????????????? ??????????????? ????????? -1
              return prev - 1;
            }
            return prev + 1;
          },
        },
      });
      //---------???????????? ???????????? ???????????? ????????????=--------
      // const fragmentId = `Photo:${id}`;
      // const fragment = gql`
      //   fragment BSName on Photo {
      //     isLiked
      //     likes
      //     # ????????????????????? ??????
      //   }
      // `;
      // const result = cache.readFragment({
      //   id: fragmentId,
      //   fragment,
      // });
      // if ("isLiked" in result && "likes" in result) {
      //   const { isLiked: cacheIsLiked, likes: cacheLikes } = result;
      //   //??????????????? ?????? ????????? ????????????+????????? ????????????!
      //   cache.writeFragment({
      //     id: fragmentId,
      //     fragment,
      //     data: {
      //       // ????????? ??????????????? ????????? ??????!
      //       isLiked: !cacheIsLiked,
      //       likes: cacheIsLiked ? cacheLikes - 1 : cacheLikes + 1,
      //       //???????????? ????????? ????????? ????????? ????????? ????????????!
      //     },
      //   });
      // }
    }
  };
  const [toggleLikeMutation] = useMutation(TOGGLE_LIKE_MUTATION, {
    variables: {
      id,
    },
    update: updateToggleLike,
    // refetchQueries
  });

  const [visible, setVisible] = useState(false);
  const openModal = () => {
    console.log("???????????????..");
    document.body.style.overflow = "hidden";
    setVisible(true);
  };
  const closeModal = () => {
    document.body.style.overflow = "unset";
    setVisible(false);
  };

  return (
    <PhotoContainer key={id}>
      <PhotoHeader>
        <Link to={`/users/${user.username}`}>
          <CircleAvatarBox>
            <CircleAvatar src={user?.avatar} />
          </CircleAvatarBox>
        </Link>
        <Link to={`/users/${user.username}`}>
          <Username>{user.username}</Username>
        </Link>
      </PhotoHeader>
      <PhotoFile src={file} />
      <PhotoDataWrapper>
        <PhotoData>
          <PhotoActions>
            <div>
              <PhotoAction onClick={toggleLikeMutation}>
                <FontAwesomeIcon
                  style={{ color: isLiked ? "tomato" : "inherit" }}
                  icon={isLiked ? SolidHeart : faHeart}
                />
              </PhotoAction>
              <PhotoAction>
                <FontAwesomeIcon onClick={() => openModal()} icon={faComment} />
              </PhotoAction>
              <Modal
                visible={visible}
                width="930"
                height="600"
                effect="fadeInUp"
                onClickAway={() => closeModal()}
              >
                <ModalScreen
                  photoId={id}
                  user={userData?.me}
                  file={file}
                  comments={comments}
                  isLiked={isLiked}
                  toggleLikeMutation={toggleLikeMutation}
                />
              </Modal>
              <PhotoAction>
                <FontAwesomeIcon icon={faPaperPlane} />
              </PhotoAction>
            </div>
            <div>
              <FontAwesomeIcon icon={faBookmark} />
            </div>
          </PhotoActions>
          <Likes>{likes === 1 ? "1 like" : `${likes} likes`}</Likes>
          <Comments
            toggleLikeMutation={toggleLikeMutation}
            isLiked={isLiked}
            file={file}
            photoId={id}
            author={user.username}
            caption={caption}
            commentNumber={commentNumber}
            comments={comments}
          />
        </PhotoData>
      </PhotoDataWrapper>
    </PhotoContainer>
  );
}

Photo.propTypes = {
  id: PropTypes.number.isRequired,
  user: PropTypes.shape({
    // shape??? ???????????? ??????
    avatar: PropTypes.string,
    username: PropTypes.string.isRequired,
  }),
  caption: PropTypes.string,
  commentNumber: PropTypes.number.isRequired,
  file: PropTypes.string.isRequired,
  isLiked: PropTypes.bool.isRequired,
  likes: PropTypes.number.isRequired,
};
export default Photo;
