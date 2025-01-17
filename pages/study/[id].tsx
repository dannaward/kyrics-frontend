import Header from '@components/common/Header';
import LoginModal from '@components/common/LoginModal';
import LyricsContainer from '@components/study/LyricsContainer';
import MobilePlayer from '@components/study/MobilePlayer/MobilePlayer';
import Player from '@components/study/Player';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useGetSongData } from 'hooks/api';
import { useMeasureWidth } from 'hooks/useMeasureWidth';
import { usePhone } from 'hooks/useMobile';
import { useDynamicModalSize } from 'hooks/useModalSize';
import useWindowSize from 'hooks/useWindowSize';
import { client } from 'lib/api';
import { useRouter } from 'next/router';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  currentTimeAtom,
  isLoginModalOpenedState,
  isYoutubeModalOpenedState,
  loopAtom,
  percentageAtom,
  songDataState,
  totalTimeAtom,
  volumeBarAtom,
  widthAtom,
} from 'states';
import useSWR from 'swr';
import { ISongData, ITimedText } from 'types';

import KeyExpression from '../../components/study/KeyExpression';

function Study(): ReactElement {
  const size = useWindowSize();
  const [isPlay, setIsPlay] = useState(false);
  const [currentTime, setCurrentTime] = useRecoilState<number>(currentTimeAtom);
  const volumeBar = useRecoilValue<number>(volumeBarAtom);
  const loop = useRecoilValue<boolean>(loopAtom);
  const [totalTime, setTotalTime] = useRecoilState<number>(totalTimeAtom);
  const hostVideo = useRef(null) as any;
  const host = hostVideo.current as ReactPlayer;
  const setPercentage = useSetRecoilState<number>(percentageAtom);
  const [modalHeight, setModalHeight] = useState<number>(0);
  const isLoginModalOpened = useRecoilValue(isLoginModalOpenedState);
  const [isYoutubeModalOpened, setYoutubeIsModalOpened] = useRecoilState(isYoutubeModalOpenedState);
  const setSongData = useSetRecoilState(songDataState);
  // recoil 값을 유지하고 있는 이유는, 모두 swr로 대체하려고 했으나, 에러 발생.
  // MobilePlayer 이쪽 때문에 에러가 발생하는 듯함.
  // 이것이 상태에 따라 UI를 보여주는 것이 아니라, display:none으로 선언되어 있기 때문에 계속 컴포넌트가 실행되고 있는 상황임.
  // 이런 상황에서 동시에 몇개의 컴포넌트에서 swr을 불러와서 그런지, 작동이 안됨.
  // MobilePlayerTop을 recoil로 유지하면 동작하지만, swr로 바꾸면 동작하지 않음.
  // 특히 즐겨찾기 post가 동작하지 않았는데, 대체 이유는 모르겠지만 MobilePlayerTop에서 recoil을 유지해야 작동했음.
  // MobilePlayer을 상태에 따라 분기처리 해주고 난 후, 전체적으로 swr 다시 적용해보겠음.
  const router = useRouter();
  const id = Number(router.query.id);
  const { data } = useSWR<{ data: { data: ISongData } }>(`/song/${id}`, client.get);
  const isPhone = usePhone();
  const songData = useGetSongData(id);
  const url = songData?.youtubeUrl;

  useEffect(() => {
    if (!data) return;
    setSongData(data?.data?.data);
  }, [data]);

  useEffect(() => {
    setPercentage(currentTime / (totalTime / 100));
  }, [currentTime]);

  useEffect(() => {
    setIsPlay(isPhone ? false : true);
  }, []);

  useEffect(() => {
    setTotalTime(Math.floor(hostVideo.current?.getDuration()));
  }, [hostVideo.current?.player?.player?.player?.getDuration]);

  const [miniPlayerOpened, setMiniPlayerOpened] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [miniPlayerOpened]);

  const handleScroll = () => {
    if (window.scrollY > 312) {
      !miniPlayerOpened && setMiniPlayerOpened(true);
    } else {
      miniPlayerOpened && setMiniPlayerOpened(false);
    }
  };

  const handleOnProgress = (e: { playedSeconds: number }) => {
    setCurrentTime(e.playedSeconds);
  };

  const handleSeekTime = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;

    setCurrentTime(parseInt(target.value));
    host.seekTo(parseFloat(target.value));
  };

  const handleLyrics = (line: ITimedText) => {
    host.seekTo(line.startTime);
    setIsPlay(true);
  };

  const handleBackTime = () => {
    if (currentTime >= 10) {
      host.seekTo(currentTime - 10);
      setCurrentTime(currentTime - 10);
    } else {
      host.seekTo(0);
      setCurrentTime(0);
    }
  };

  const handleForwardTime = () => {
    if (currentTime <= totalTime - 10) {
      setCurrentTime(currentTime + 10);
      host.seekTo(currentTime + 10);
    } else {
      setCurrentTime(totalTime);
      host.seekTo(totalTime);
    }
  };

  useDynamicModalSize(setModalHeight, isYoutubeModalOpened);

  useMeasureWidth();
  const width = useRecoilValue(widthAtom);

  return (
    <Styled.Root isYoutubeModalOpened={isYoutubeModalOpened}>
      <Header />
      <Styled.ModalWrapper isYoutubeModalOpened={isYoutubeModalOpened}>
        <Styled.Modal modalHeight={modalHeight}>
          <ReactPlayer
            playing={isPlay}
            url={url}
            loop={loop}
            controls={true}
            volume={volumeBar / 100}
            ref={hostVideo}
            width="100%"
            height="100%"
            onProgress={handleOnProgress}
            onPlay={() => setIsPlay(true)}
            onPause={() => setIsPlay(false)}
            progressInterval={100}
            playsinline={true}
          />
          <img
            src="/assets/icons/modalCloseIcon.svg"
            alt=""
            onClick={() => setYoutubeIsModalOpened(false)}
            aria-hidden="true"
          />
        </Styled.Modal>
      </Styled.ModalWrapper>
      <MobilePlayer
        isPlay={isPlay}
        setIsPlay={setIsPlay}
        handleSeekTime={handleSeekTime}
        handleBackTime={handleBackTime}
        handleForwardTime={handleForwardTime}
      />
      <Player
        isPlay={isPlay}
        setIsPlay={setIsPlay}
        handleSeekTime={handleSeekTime}
        handleBackTime={handleBackTime}
        handleForwardTime={handleForwardTime}
      />
      <Styled.Main width={width}>
        <LyricsContainer handleLyrics={handleLyrics} currentTime={currentTime} />
        {size && size.width > 1080 && <KeyExpression />}
      </Styled.Main>
      {isLoginModalOpened && <LoginModal />}
    </Styled.Root>
  );
}

export default Study;

const Styled = {
  Root: styled.div<{ isYoutubeModalOpened: boolean }>`
    position: relative;
    ${({ isYoutubeModalOpened }) =>
      isYoutubeModalOpened &&
      css`
        height: 100vh;
        overflow-y: hidden;
      `}
  `,
  ModalWrapper: styled.div<{ isYoutubeModalOpened: boolean }>`
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    justify-content: center;
    visibility: ${({ isYoutubeModalOpened }) => (isYoutubeModalOpened ? 'visible' : 'hidden')};
    z-index: 1100000;
    background: rgba(0, 0, 0, 0.8);
    width: 100vw;
    height: 100vh;
    overflow-y: hidden;
  `,
  Modal: styled.div<{ modalHeight: number }>`
    position: fixed;
    top: 90px;
    width: 70%;
    height: ${({ modalHeight }) => `${modalHeight}px`};
    img {
      position: absolute;
      top: 15.33px;
      right: -28.33px;
      transform: translateX(100%);
      cursor: pointer;

      @media (max-width: 415px) {
        top: 10px;
        right: -10px;
      }
    }
  `,
  Main: styled.main<{ width: number }>`
    display: flex;
    justify-content: center;
    padding: 0px ${({ width }) => (141 * width) / 1440}px;
  `,
};
